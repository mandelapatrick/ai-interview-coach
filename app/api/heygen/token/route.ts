import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;

    console.log("[HeyGen API] Token request received");

    if (!apiKey) {
      console.error("[HeyGen API] HEYGEN_API_KEY not configured");
      return NextResponse.json(
        { error: "HEYGEN_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("[HeyGen API] Requesting session token from LiveAvatar...");

    // Generate a new session token from LiveAvatar API (CUSTOM mode with LiveKit)
    const tokenResponse = await fetch(
      "https://api.liveavatar.com/v1/sessions/token",
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "CUSTOM",
          avatar_id: "073b60a9-89a8-45aa-8902-c358f64d2852",
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[HeyGen API] Token request failed:", tokenResponse.status, errorText);
      return NextResponse.json(
        { error: `Failed to generate LiveAvatar token: ${errorText}` },
        { status: tokenResponse.status }
      );
    }

    const tokenResult = await tokenResponse.json();
    console.log("[HeyGen API] Token response received:", {
      hasData: !!tokenResult.data,
      hasSessionToken: !!tokenResult.data?.session_token,
      hasSessionId: !!tokenResult.data?.session_id,
      sessionId: tokenResult.data?.session_id,
    });

    if (!tokenResult.data?.session_token) {
      console.error("[HeyGen API] No session_token in response:", tokenResult);
      return NextResponse.json(
        { error: "No session token in LiveAvatar response" },
        { status: 500 }
      );
    }

    const sessionToken = tokenResult.data.session_token;
    const sessionId = tokenResult.data.session_id;

    console.log("[HeyGen API] Returning token for session:", sessionId);

    return NextResponse.json({
      sessionId,
      sessionToken,
    });
  } catch (error) {
    console.error("[HeyGen API] Token generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
