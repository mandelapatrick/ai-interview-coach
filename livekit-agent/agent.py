import os
import json
import logging
from dotenv import load_dotenv

load_dotenv(".env.local", override=False)

logger = logging.getLogger("interview-agent")

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli, room_io
from livekit.plugins import openai, elevenlabs, silero, anam, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel


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
        except (json.JSONDecodeError, TypeError):
            system_prompt = raw or "You are a case interview coach."
            avatar_mode = "anam"

        logger.info(f"Avatar mode: {avatar_mode}")

        eleven_key = os.getenv("ELEVEN_API_KEY")

        session = AgentSession(
            stt=elevenlabs.STT(api_key=eleven_key, language_code="en"),
            llm=openai.LLM(model="gpt-4o"),
            tts=elevenlabs.TTS(
                api_key=eleven_key,
                voice_id="o0A9ZeHFlYO5UFbSjH7b",
                model="eleven_turbo_v2_5",
            ),
            vad=silero.VAD.load(),
            # turn_detection=MultilingualModel(),
        )

        # Only start Anam avatar when avatar_mode is "anam"
        if avatar_mode == "anam":
            avatar = anam.AvatarSession(
                persona_config=anam.PersonaConfig(
                    name="Interviewer",
                    avatarId="bdaaedfa-00f2-417a-8239-8bb89adec682",
                ),
                api_key=os.getenv("ANAM_API_KEY"),
            )
            logger.info("Starting avatar session...")
            await avatar.start(session, room=ctx.room)

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
            instructions="Greet the candidate and present the case."
        )
    except Exception as e:
        logger.error(f"Agent entrypoint failed: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="interview-agent"))
