import { NextRequest, NextResponse } from "next/server";

const ASSESSMENT_PROMPT = `You are an expert management consulting interview coach. Analyze the following case interview transcript and provide a detailed assessment.

Score each criterion on a scale of 1-5:
- 1: Poor - Major gaps, needs significant improvement
- 2: Below Average - Some understanding but notable weaknesses
- 3: Average - Meets basic expectations
- 4: Good - Strong performance with minor areas to improve
- 5: Excellent - Outstanding, consultant-ready

Criteria to evaluate:
1. Structure (25%) - Did they use a clear, logical framework to approach the problem?
2. Problem Solving (20%) - Did they identify key issues and analyze them effectively?
3. Business Judgment (20%) - Were their insights commercially sound and realistic?
4. Communication (15%) - Was their delivery clear, concise, and well-organized?
5. Quantitative Rigor (10%) - Were calculations accurate and approach to numbers sound?
6. Creativity (10%) - Did they show novel thinking or unique insights?

Respond in this exact JSON format:
{
  "overallScore": <number 1-5 with one decimal>,
  "scores": {
    "structure": <number 1-5>,
    "problemSolving": <number 1-5>,
    "businessJudgment": <number 1-5>,
    "communication": <number 1-5>,
    "quantitative": <number 1-5>,
    "creativity": <number 1-5>
  },
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, questionTitle, questionType } = await request.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    // Format transcript for the AI
    const formattedTranscript = transcript
      .map((entry: { role: string; text: string }) =>
        `${entry.role === "user" ? "Candidate" : "Interviewer"}: ${entry.text}`
      )
      .join("\n\n");

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: ASSESSMENT_PROMPT,
          },
          {
            role: "user",
            content: `Case Interview Assessment Request

Question: ${questionTitle}
Type: ${questionType}

Transcript:
${formattedTranscript}

Please provide your assessment in the specified JSON format.`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Grok API error:", error);
      return NextResponse.json(
        { error: "Failed to generate assessment" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No assessment generated" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const assessment = JSON.parse(jsonMatch[0]);
      return NextResponse.json(assessment);
    } catch (parseError) {
      console.error("Failed to parse assessment:", parseError, content);
      // Return a fallback assessment
      return NextResponse.json({
        overallScore: 3.0,
        scores: {
          structure: 3,
          problemSolving: 3,
          businessJudgment: 3,
          communication: 3,
          quantitative: 3,
          creativity: 3,
        },
        feedback: "Assessment could not be fully parsed. Please try again.",
        strengths: ["Completed the interview", "Engaged with the case"],
        improvements: ["Continue practicing", "Work on structure"],
      });
    }
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
