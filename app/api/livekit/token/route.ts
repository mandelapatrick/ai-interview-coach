import { NextRequest, NextResponse } from "next/server";
import { AccessToken, RoomAgentDispatch, RoomConfiguration } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, avatarMode } = await req.json();

    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    // Generate unique room name per session
    const roomName = `interview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const token = new AccessToken(apiKey, apiSecret, {
      identity: `user-${Date.now()}`,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // Configure room with agent dispatch and metadata
    const roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({ agentName: "interview-agent" }),
      ],
    });
    roomConfig.metadata = JSON.stringify({
      system_prompt: systemPrompt || "",
      avatar_mode: avatarMode || "anam",
    });

    token.roomConfig = roomConfig;

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      roomName,
      url: livekitUrl,
    });
  } catch (error) {
    console.error("[LiveKit Token] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate LiveKit token" },
      { status: 500 }
    );
  }
}
