import { NextRequest, NextResponse } from "next/server";

// Anam Avatar IDs - Different avatars for interviewer vs candidate
const ANAM_AVATARS = {
  interviewer: "ae2ea8c1-db28-47e3-b6ea-493e4ed3c554", // Professional interviewer
  candidate: "edf6fdcb-acab-44b8-b974-ded72665ee26", // Candidate avatar
};

// Voice IDs from Anam - Using same voice for both for now
const ANAM_VOICES = {
  interviewer: "a57043ba-5976-4fbb-b065-d3aad4f5338b", // Professional voice
  candidate: "a57043ba-5976-4fbb-b065-d3aad4f5338b", // Same voice for now (TODO: use different one)
};

// LLM ID
const ANAM_LLMS = {
  kimiK2Instruct: "7736a22f-2d79-4720-952c-25fdca55ad40",
};

async function generateToken(
  apiKey: string,
  avatarId: string,
  voiceId: string,
  systemPrompt: string
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
          llmId: ANAM_LLMS.kimiK2Instruct,
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

    // Generate both tokens in parallel
    const [interviewerToken, candidateToken] = await Promise.all([
      generateToken(
        apiKey,
        ANAM_AVATARS.interviewer,
        ANAM_VOICES.interviewer,
        interviewerPrompt
      ),
      generateToken(
        apiKey,
        ANAM_AVATARS.candidate,
        ANAM_VOICES.candidate,
        candidatePrompt
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
