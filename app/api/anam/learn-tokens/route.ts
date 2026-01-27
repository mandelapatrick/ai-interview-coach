import { NextRequest, NextResponse } from "next/server";

// Anam Avatars with corresponding voices - randomly select 2 unique per session
const ANAM_AVATARS = [
  { avatarId: "edf6fdcb-acab-44b8-b974-ded72665ee26", voiceId: "d79f2051-3a89-4fcc-8c71-cf5d53f9d9e0" },
  { avatarId: "8a339c9f-0666-46bd-ab27-e90acd0409dc", voiceId: "e36f160f-5f2b-4684-94c0-fcdf9f8be7c5" },
  { avatarId: "ae2ea8c1-db28-47e3-b6ea-493e4ed3c554", voiceId: "f013d22e-276a-4111-ac6d-32ec86ca42fe" },
  { avatarId: "8dd64886-ce4b-47d5-b837-619660854768", voiceId: "fe81aa2c-ad74-486e-b8e6-57ec0906366f" },
];

type Avatar = { avatarId: string; voiceId: string };

function getTwoRandomAvatars(): [Avatar, Avatar] {
  const shuffled = [...ANAM_AVATARS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

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

    // Select two unique random avatars with their corresponding voices
    const [interviewer, candidate] = getTwoRandomAvatars();
    console.log("[Learn Tokens API] Selected - Interviewer:", interviewer.avatarId, "Candidate:", candidate.avatarId);

    // Generate both tokens in parallel
    // Using GPT-4 Mini for candidate to get shorter, more interactive responses
    const [interviewerToken, candidateToken] = await Promise.all([
      generateToken(
        apiKey,
        interviewer.avatarId,
        interviewer.voiceId,
        interviewerPrompt,
        ANAM_LLMS.kimiK2Instruct
      ),
      generateToken(
        apiKey,
        candidate.avatarId,
        candidate.voiceId,
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
