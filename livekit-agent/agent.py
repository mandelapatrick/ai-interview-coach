import os
import logging
from dotenv import load_dotenv

load_dotenv(".env.local", override=False)

logger = logging.getLogger("interview-agent")

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai, elevenlabs, silero, anam


async def entrypoint(ctx: JobContext):
    try:
        await ctx.connect()
        logger.info(f"Connected to room: {ctx.room.name}")

        # Log when we subscribe to participant tracks (confirms mic audio is received)
        @ctx.room.on("track_subscribed")
        def on_track_subscribed(track, publication, participant):
            logger.info(f"Subscribed to track: {track.kind} source={track.source} from {participant.identity}")

        system_prompt = ctx.room.metadata or "You are a case interview coach."

        eleven_key = os.getenv("ELEVEN_API_KEY")

        session = AgentSession(
            stt=elevenlabs.STT(api_key=eleven_key),
            llm=openai.LLM(model="gpt-4o"),
            tts=elevenlabs.TTS(
                api_key=eleven_key,
                voice_id="o0A9ZeHFlYO5UFbSjH7b",
                model="eleven_turbo_v2_5",
            ),
            vad=silero.VAD.load(),
        )

        avatar = anam.AvatarSession(
            persona_config=anam.PersonaConfig(
                name="Interviewer",
                avatarId="edf6fdcb-acab-44b8-b974-ded72665ee26",
            ),
            api_key=os.getenv("ANAM_API_KEY"),
        )

        logger.info("Starting avatar session...")
        await avatar.start(session, room=ctx.room)
        logger.info("Starting agent session...")
        await session.start(
            agent=Agent(instructions=system_prompt),
            room=ctx.room,
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
