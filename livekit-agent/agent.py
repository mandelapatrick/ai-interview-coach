import os
import json
import re
import asyncio
import logging
from dotenv import load_dotenv

load_dotenv(".env.local", override=False)

logger = logging.getLogger("interview-agent")

from livekit import rtc
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli, room_io
from livekit.plugins import openai, elevenlabs, silero, anam, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

# Preload Silero VAD model at module level so it's cached before the first job arrives
_preloaded_vad = silero.VAD.load()

# Anam avatar IDs for learn mode (interviewer and candidate)
INTERVIEWER_AVATAR_ID = "bdaaedfa-00f2-417a-8239-8bb89adec682"
CANDIDATE_AVATAR_ID = "c1785d08-9825-4ead-89b3-171d3f667c47"

# ElevenLabs voice IDs
INTERVIEWER_VOICE_ID = "o0A9ZeHFlYO5UFbSjH7b"
CANDIDATE_VOICE_ID = "ud0kCO8FgufQlMpW9wg6"

# Pattern to detect exhibit references in agent speech (e.g., "Exhibit 1", "exhibit 2")
EXHIBIT_PATTERN = re.compile(r'exhibit\s*(\d+)', re.IGNORECASE)


async def run_learn_mode(ctx: JobContext, meta: dict):
    """Run learn mode with two agent sessions having a conversation."""
    interviewer_prompt = meta.get("interviewer_prompt", "You are an interviewer.")
    candidate_prompt = meta.get("candidate_prompt", "You are a candidate.")
    max_turns = meta.get("max_turns", 10)

    eleven_key = os.getenv("ELEVEN_API_KEY")
    anam_key = os.getenv("ANAM_API_KEY")

    logger.info(f"Learn mode: max_turns={max_turns}")

    # Create two AgentSessions - no STT/VAD needed (no user audio input)
    interviewer_session = AgentSession(
        llm=openai.LLM(model="gpt-4o"),
        tts=elevenlabs.TTS(
            api_key=eleven_key,
            voice_id=INTERVIEWER_VOICE_ID,
            model="eleven_turbo_v2_5",
        ),
    )

    candidate_session = AgentSession(
        llm=openai.LLM(model="gpt-4o"),
        tts=elevenlabs.TTS(
            api_key=eleven_key,
            voice_id=CANDIDATE_VOICE_ID,
            model="eleven_turbo_v2_5",
        ),
    )

    # Create two Anam avatar sessions with different personas and unique identities
    interviewer_avatar = anam.AvatarSession(
        persona_config=anam.PersonaConfig(
            name="Interviewer",
            avatarId=INTERVIEWER_AVATAR_ID,
        ),
        api_key=anam_key,
        avatar_participant_identity="interviewer-avatar",
        avatar_participant_name="Interviewer",
    )

    candidate_avatar = anam.AvatarSession(
        persona_config=anam.PersonaConfig(
            name="Candidate",
            avatarId=CANDIDATE_AVATAR_ID,
        ),
        api_key=anam_key,
        avatar_participant_identity="candidate-avatar",
        avatar_participant_name="Expert Candidate",
    )

    # Start avatar sessions (each binds to its agent session's audio output)
    logger.info("Starting interviewer avatar session...")
    await interviewer_avatar.start(interviewer_session, room=ctx.room)

    logger.info("Starting candidate avatar session...")
    await candidate_avatar.start(candidate_session, room=ctx.room)

    # Start both agent sessions with no audio/text input (conversation is orchestrated)
    logger.info("Starting interviewer agent session...")
    await interviewer_session.start(
        agent=Agent(instructions=interviewer_prompt),
        room=ctx.room,
        room_input_options=room_io.RoomInputOptions(
            audio_enabled=False,
            text_enabled=False,
        ),
    )

    logger.info("Starting candidate agent session...")
    await candidate_session.start(
        agent=Agent(instructions=candidate_prompt),
        room=ctx.room,
        room_input_options=room_io.RoomInputOptions(
            audio_enabled=False,
            text_enabled=False,
        ),
    )

    # Conversation state
    pause_event = asyncio.Event()
    pause_event.set()  # Start unpaused
    stop_requested = False
    pending_question = None
    current_handle = None  # Track the active SpeechHandle for interruption

    # Helper to send data messages to the frontend
    async def send_data(payload: dict):
        try:
            data = json.dumps(payload).encode("utf-8")
            await ctx.room.local_participant.publish_data(data, reliable=True)
        except Exception as e:
            logger.error(f"Failed to send data message: {e}")

    # Listen for data messages from frontend
    @ctx.room.on("data_received")
    def on_data_received(data_packet):
        nonlocal stop_requested, pending_question
        try:
            msg = json.loads(data_packet.data.decode("utf-8"))
            msg_type = msg.get("type")
            logger.info(f"Received data message: {msg_type}")

            if msg_type == "pause":
                pause_event.clear()
                if current_handle and not current_handle.done():
                    current_handle.interrupt(force=True)
            elif msg_type == "resume":
                pause_event.set()
            elif msg_type == "ask_question":
                pending_question = msg.get("text", "")
                pause_event.set()  # Unpause to process question
            elif msg_type == "end":
                stop_requested = True
                pause_event.set()  # Unpause to allow loop to exit
        except Exception as e:
            logger.error(f"Failed to parse data message: {e}")

    async def generate_and_wait(session, instructions):
        """Generate a reply and handle pause/interrupt. Re-generates if interrupted."""
        nonlocal current_handle
        while True:
            handle = session.generate_reply(instructions=instructions)
            current_handle = handle
            await handle
            current_handle = None
            if handle.interrupted:
                logger.info("Speech interrupted by pause, waiting for resume...")
                await pause_event.wait()
                if stop_requested:
                    return handle
                logger.info("Resumed after interrupt, re-generating reply")
                continue
            return handle

    # Run the conversation loop
    turn = 0
    conversation_history = []

    try:
        while turn < max_turns and not stop_requested:
            # Wait if paused
            await pause_event.wait()
            if stop_requested:
                break

            # --- Interviewer's turn ---
            await send_data({"type": "speaker_change", "speaker": "interviewer"})

            if turn == 0:
                instructions = "Greet the candidate warmly and ask how they're doing. Do NOT ask your interview question yet — wait for them to respond first."
            else:
                last_candidate_text = conversation_history[-1]["text"] if conversation_history else ""
                instructions = f"The candidate just said: \"{last_candidate_text}\"\n\nAsk a follow-up question or move to the next topic."

            logger.info(f"Turn {turn}: Interviewer generating reply...")
            handle = await generate_and_wait(interviewer_session, instructions)
            if stop_requested:
                break
            interviewer_text = ""
            for item in handle.chat_items:
                if hasattr(item, "text_content") and item.text_content:
                    interviewer_text = item.text_content
                    break

            if not interviewer_text:
                logger.warning("Interviewer produced no text, using fallback")
                interviewer_text = "Let's continue with the next question."

            conversation_history.append({"speaker": "interviewer", "text": interviewer_text})
            logger.info(f"Interviewer said: {interviewer_text[:80]}...")

            # Check for stop/pause between turns
            if stop_requested:
                break
            await pause_event.wait()
            if stop_requested:
                break

            # Handle pending user question if any
            if pending_question:
                question_text = pending_question
                pending_question = None

                await send_data({"type": "speaker_change", "speaker": "candidate"})
                logger.info(f"Processing user question: {question_text[:80]}...")

                q_instructions = f"The observer asks you: \"{question_text}\"\n\nAnswer this question directly, then the interview will resume."
                q_handle = await generate_and_wait(candidate_session, q_instructions)
                if stop_requested:
                    break
                q_answer = ""
                for item in q_handle.chat_items:
                    if hasattr(item, "text_content") and item.text_content:
                        q_answer = item.text_content
                        break

                if q_answer:
                    conversation_history.append({"speaker": "candidate", "text": f"[User Q&A] {q_answer}"})

                if stop_requested:
                    break
                await pause_event.wait()
                if stop_requested:
                    break

            # --- Candidate's turn ---
            await send_data({"type": "speaker_change", "speaker": "candidate"})

            candidate_instructions = f"The interviewer just said: \"{interviewer_text}\"\n\nProvide your response."

            logger.info(f"Turn {turn}: Candidate generating reply...")
            handle = await generate_and_wait(candidate_session, candidate_instructions)
            if stop_requested:
                break
            candidate_text = ""
            for item in handle.chat_items:
                if hasattr(item, "text_content") and item.text_content:
                    candidate_text = item.text_content
                    break

            if not candidate_text:
                logger.warning("Candidate produced no text, using fallback")
                candidate_text = "That's a great question. Let me think about that."

            conversation_history.append({"speaker": "candidate", "text": candidate_text})
            logger.info(f"Candidate said: {candidate_text[:80]}...")

            turn += 1

        # Session ended
        reason = "stopped" if stop_requested else "max_turns"
        await send_data({"type": "session_end", "reason": reason})
        logger.info(f"Learn mode session ended: {reason}, {turn} turns completed")

    except Exception as e:
        logger.error(f"Learn mode conversation loop failed: {e}", exc_info=True)
        await send_data({"type": "session_end", "reason": "error"})


async def entrypoint(ctx: JobContext):
    try:
        await ctx.connect()
        logger.info(f"Connected to room: {ctx.room.name}")

        # Log when we subscribe to participant tracks (confirms mic audio is received)
        @ctx.room.on("track_subscribed")
        def on_track_subscribed(track, publication, participant):
            logger.info(f"Subscribed to track: {track.kind} source={publication.source} from {participant.identity}")

        # Parse room metadata as JSON for structured config
        raw = ctx.room.metadata or "{}"
        try:
            meta = json.loads(raw)
            system_prompt = meta.get("system_prompt", "You are a case interview coach.")
            avatar_mode = meta.get("avatar_mode", "anam")
            mode = meta.get("mode", "practice")
        except (json.JSONDecodeError, TypeError):
            system_prompt = raw or "You are a case interview coach."
            avatar_mode = "anam"
            mode = "practice"

        logger.info(f"Mode: {mode}, Avatar mode: {avatar_mode}")

        # Branch on mode
        if mode == "learn":
            await run_learn_mode(ctx, meta)
            return

        # --- Practice mode (existing behavior) ---
        eleven_key = os.getenv("ELEVEN_API_KEY")

        session = AgentSession(
            stt=elevenlabs.STT(api_key=eleven_key, language_code="en"),
            llm=openai.LLM(model="gpt-4o"),
            tts=elevenlabs.TTS(
                api_key=eleven_key,
                voice_id=INTERVIEWER_VOICE_ID,
                model="eleven_turbo_v2_5",
            ),
            vad=_preloaded_vad,
            min_interruption_duration=0.8,  # Require longer speech to interrupt (was 0.5)
            min_interruption_words=2,       # Require at least 2 words before interrupting
            # turn_detection=MultilingualModel(),
        )

        # Only start Anam avatar when avatar_mode is "anam"
        if avatar_mode == "anam":
            avatar = anam.AvatarSession(
                persona_config=anam.PersonaConfig(
                    name="Interviewer",
                    avatarId=INTERVIEWER_AVATAR_ID,
                ),
                api_key=os.getenv("ANAM_API_KEY"),
            )
            logger.info("Starting avatar session...")
            await avatar.start(session, room=ctx.room)

        # Exhibit reveal support for practice mode
        exhibit_count = meta.get("exhibit_count", 0)
        revealed_exhibits = set()

        async def send_practice_data(payload: dict):
            try:
                data = json.dumps(payload).encode("utf-8")
                await ctx.room.local_participant.publish_data(data, reliable=True)
            except Exception as e:
                logger.error(f"Failed to send practice data message: {e}")

        if exhibit_count > 0:
            @session.on("conversation_item_added")
            def on_practice_speech(ev):
                item = ev.item
                if not hasattr(item, "role") or item.role != "assistant":
                    return
                text = item.text_content or ""
                for match in EXHIBIT_PATTERN.finditer(text):
                    idx = int(match.group(1)) - 1
                    if 0 <= idx < exhibit_count and idx not in revealed_exhibits:
                        revealed_exhibits.add(idx)
                        logger.info(f"Revealing exhibit {idx + 1}")
                        asyncio.create_task(send_practice_data({
                            "type": "reveal_exhibit",
                            "exhibit_index": idx,
                        }))

        logger.info("Starting agent session...")
        await session.start(
            agent=Agent(instructions=system_prompt),
            room=ctx.room,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    noise_cancellation=noise_cancellation.BVC(),
                ),
            ),
        )
        logger.info("Generating initial reply...")
        await session.generate_reply(
            instructions="Greet the candidate warmly and ask how they're doing. Do NOT present the case yet — wait for them to respond first."
        )
    except Exception as e:
        logger.error(f"Agent entrypoint failed: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="interview-agent"))
