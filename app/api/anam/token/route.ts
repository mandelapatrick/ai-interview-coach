import { NextRequest, NextResponse } from "next/server";

// Anam Avatar IDs - randomly select one per session
const ANAM_AVATAR_IDS = [
  "edf6fdcb-acab-44b8-b974-ded72665ee26",
  "8a339c9f-0666-46bd-ab27-e90acd0409dc",
  "ae2ea8c1-db28-47e3-b6ea-493e4ed3c554",
  "8dd64886-ce4b-47d5-b837-619660854768",
];

function getRandomAvatar(): string {
  return ANAM_AVATAR_IDS[Math.floor(Math.random() * ANAM_AVATAR_IDS.length)];
}

// Voice IDs from Anam
const ANAM_VOICES = {
  default: "a57043ba-5976-4fbb-b065-d3aad4f5338b",
};

// LLM IDs from Anam (use UUIDs, not display names)
const ANAM_LLMS = {
  kimiK2Instruct: "7736a22f-2d79-4720-952c-25fdca55ad40", // kimi-k2-instruct-0905
  kimiK2: "88190a76-3e87-4935-ab39-f4f73038815a", // kimi-k2
  gpt4Mini: "0934d97d-0c3a-4f33-91b0-5e136a0ef466", // gpt-4.1-mini
  llama70b: "ANAM_LLAMA_v3_3_70B_V1", // llama-3.3-70b
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANAM_API_KEY;
    const body = await request.json();
    const { systemPrompt } = body;

    console.log("[Anam API] Token request received");

    if (!apiKey) {
      console.error("[Anam API] ANAM_API_KEY not configured");
      return NextResponse.json(
        { error: "ANAM_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!systemPrompt) {
      console.error("[Anam API] System prompt not provided");
      return NextResponse.json(
        { error: "System prompt is required" },
        { status: 400 }
      );
    }

    console.log("[Anam API] Requesting session token from Anam...");
    console.log("[Anam API] Using LLM:", ANAM_LLMS.kimiK2Instruct);

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
            avatarId: getRandomAvatar(),
            voiceId: ANAM_VOICES.default,
            llmId: ANAM_LLMS.kimiK2Instruct, // Anam handles conversation with Kimi K2 LLM
            systemPrompt: systemPrompt,
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
