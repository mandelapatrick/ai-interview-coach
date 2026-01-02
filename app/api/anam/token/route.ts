import { NextResponse } from "next/server";

// Anam Avatar IDs - Update this with your preferred avatar from https://docs.anam.ai/resources/avatar-gallery
const ANAM_AVATARS = {
  // Default avatar (Layla) - TODO: Update with actual Layla avatar ID from gallery
  layla: "ae2ea8c1-db28-47e3-b6ea-493e4ed3c554", // Currently using Cara as placeholder
};

// Voice IDs from Anam
const ANAM_VOICES = {
  default: "a57043ba-5976-4fbb-b065-d3aad4f5338b",
};

// LLM IDs from Anam - Use CUSTOMER_CLIENT_V1 when handling conversation externally
const ANAM_LLMS = {
  customerClient: "CUSTOMER_CLIENT_V1", // For client-side/external conversation handling
  gpt4Mini: "0934d97d-0c3a-4f33-91b0-5e136a0ef466",
  llama70b: "ANAM_LLAMA_v3_3_70B_V1",
};

export async function POST() {
  try {
    const apiKey = process.env.ANAM_API_KEY;

    console.log("[Anam API] Token request received");

    if (!apiKey) {
      console.error("[Anam API] ANAM_API_KEY not configured");
      return NextResponse.json(
        { error: "ANAM_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("[Anam API] Requesting session token from Anam...");

    // Generate a new session token from Anam API
    const tokenResponse = await fetch(
      "https://api.anam.ai/v1/auth/session-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personaConfig: {
            avatarId: ANAM_AVATARS.layla,
            voiceId: ANAM_VOICES.default,
            llmId: ANAM_LLMS.customerClient, // Use client-side processing since X.AI handles conversation
            systemPrompt: "You are an AI interviewer conducting a case interview.",
          },
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[Anam API] Token request failed:", tokenResponse.status, errorText);
      return NextResponse.json(
        { error: `Failed to generate Anam token: ${errorText}` },
        { status: tokenResponse.status }
      );
    }

    const tokenResult = await tokenResponse.json();
    console.log("[Anam API] Token response received:", JSON.stringify(tokenResult, null, 2));

    // The API returns the token directly or nested - handle both cases
    const sessionToken = tokenResult.sessionToken || tokenResult.session_token || tokenResult;

    if (!sessionToken || typeof sessionToken !== 'string') {
      console.error("[Anam API] No sessionToken in response:", tokenResult);
      return NextResponse.json(
        { error: "No session token in Anam response" },
        { status: 500 }
      );
    }

    console.log("[Anam API] Returning session token");

    return NextResponse.json({
      sessionToken: sessionToken,
    });
  } catch (error) {
    console.error("[Anam API] Token generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
