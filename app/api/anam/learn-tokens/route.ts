import { NextRequest, NextResponse } from "next/server";

// Anam Avatar IDs - randomly select 2 unique avatars per session
const ANAM_AVATAR_IDS = [
  "edf6fdcb-acab-44b8-b974-ded72665ee26",
  "8a339c9f-0666-46bd-ab27-e90acd0409dc",
  "ae2ea8c1-db28-47e3-b6ea-493e4ed3c554",
  "8dd64886-ce4b-47d5-b837-619660854768",
];

function getTwoRandomAvatars(): [string, string] {
  const shuffled = [...ANAM_AVATAR_IDS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

// Voice IDs from Anam - Using same voice for both for now
const ANAM_VOICES = {
  interviewer: "a57043ba-5976-4fbb-b065-d3aad4f5338b", // Professional voice
  candidate: "a57043ba-5976-4fbb-b065-d3aad4f5338b", // Same voice for now (TODO: use different one)
};

// LLM IDs
const ANAM_LLMS = {
  kimiK2Instruct: "7736a22f-2d79-4720-952c-25fdca55ad40",
  gpt4Mini: "0934d97d-0c3a-4f33-91b0-5e136a0ef466",
};

async function generateToken(
  apiKey: string,
  avatarId: string,
  voiceId: string,
  systemPrompt: string,
  llmId: string
): Promise<string> {
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
          avatarId,
          voiceId,
          llmId,
          systemPrompt,
        },
      }),
    }
  );

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to generate token: ${errorText}`);
  }

  const tokenResult = await tokenResponse.json();
  const sessionToken =
    tokenResult.sessionToken || tokenResult.session_token || tokenResult;

  if (!sessionToken || typeof sessionToken !== "string") {
    throw new Error("No session token in response");
  }

  return sessionToken;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANAM_API_KEY;
    const body = await request.json();
    const { interviewerPrompt, candidatePrompt } = body;

    console.log("[Learn Tokens API] Request received");

    if (!apiKey) {
      console.error("[Learn Tokens API] ANAM_API_KEY not configured");
      return NextResponse.json(
        { error: "ANAM_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!interviewerPrompt || !candidatePrompt) {
      console.error("[Learn Tokens API] Missing prompts");
      return NextResponse.json(
        { error: "Both interviewerPrompt and candidatePrompt are required" },
        { status: 400 }
      );
    }

    console.log("[Learn Tokens API] Generating tokens for interviewer and candidate...");

    // Select two unique random avatars
    const [interviewerAvatar, candidateAvatar] = getTwoRandomAvatars();
    console.log("[Learn Tokens API] Selected avatars - Interviewer:", interviewerAvatar, "Candidate:", candidateAvatar);

    // Generate both tokens in parallel
    // Using GPT-4 Mini for candidate to get shorter, more interactive responses
    const [interviewerToken, candidateToken] = await Promise.all([
      generateToken(
        apiKey,
        interviewerAvatar,
        ANAM_VOICES.interviewer,
        interviewerPrompt,
        ANAM_LLMS.kimiK2Instruct
      ),
      generateToken(
        apiKey,
        candidateAvatar,
        ANAM_VOICES.candidate,
        candidatePrompt,
        ANAM_LLMS.gpt4Mini
      ),
    ]);

    console.log("[Learn Tokens API] Tokens generated successfully");

    return NextResponse.json({
      interviewerToken,
      candidateToken,
    });
  } catch (error) {
    console.error("[Learn Tokens API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
