import { NextRequest, NextResponse } from "next/server";

interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
}

const HINT_SYSTEM_PROMPT = `You are a helpful interview coach providing hints during a practice case interview. Your goal is to help the candidate make progress without giving away the answer directly.

Guidelines:
- Identify what the candidate has already figured out from the conversation
- Identify where they seem stuck or what they might be missing
- Provide a gentle nudge in the right direction
- Use Socratic questioning when possible ("Have you considered...", "What might happen if...")
- Keep hints brief (1-3 sentences maximum)
- Never reveal specific numbers, calculations, or the direct answer
- Frame hints as thought-provoking questions or gentle suggestions
- Be encouraging and supportive in tone

Hint progression:
- Hint 1: Very subtle, general direction ("Think about the different components that might affect...")
- Hint 2: More specific area to focus on ("Consider looking at the cost side of the equation...")
- Hint 3: Pointed guidance without the answer ("The data shows something interesting about fuel costs...")`;

export async function POST(request: NextRequest) {
  try {
    const { solution, transcript, questionTitle, hintNumber } = await request.json();

    if (!solution) {
      return NextResponse.json(
        { error: "No solution provided" },
        { status: 400 }
      );
    }

    // Format transcript for context
    const formattedTranscript = transcript && transcript.length > 0
      ? transcript
          .map((entry: TranscriptEntry) =>
            `${entry.role === "user" ? "Candidate" : "Interviewer"}: ${entry.text}`
          )
          .join("\n\n")
      : "No conversation yet - the interview just started.";

    const hintLevel = Math.min(hintNumber || 1, 3);
    const hintDescription =
      hintLevel === 1 ? "very subtle and general" :
      hintLevel === 2 ? "more specific but still indirect" :
      "pointed and helpful but still not revealing the answer";

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-fast",
        messages: [
          {
            role: "system",
            content: HINT_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Generate a hint for this case interview.

Question: ${questionTitle}

Solution (for your reference only - DO NOT reveal this directly):
${solution}

Conversation so far:
${formattedTranscript}

This is hint #${hintLevel}. The hint should be ${hintDescription}.

Provide ONLY the hint text, nothing else. Do not include any preamble like "Here's a hint:" - just the hint itself.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Grok API error:", error);
      return NextResponse.json(
        { error: "Failed to generate hint" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const hint = data.choices?.[0]?.message?.content?.trim();

    if (!hint) {
      return NextResponse.json(
        { error: "No hint generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hint,
      hintNumber: hintLevel,
    });
  } catch (error) {
    console.error("Hint generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
