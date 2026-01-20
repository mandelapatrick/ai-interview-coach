import { NextRequest, NextResponse } from "next/server";
import { getRubricConfig } from "@/data/rubrics";
import { saveCalibrationTranscript } from "@/lib/calibration-dataset";

const CONSULTING_ASSESSMENT_PROMPT = `You are an expert management consulting interview coach. Analyze the following case interview transcript and provide a detailed assessment.

CRITICAL: ONLY evaluate content ACTUALLY in the transcript. Do NOT fabricate responses. If the candidate provided no substantive response, score ALL criteria 1/5. You must quote actual candidate text as evidence.

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

const PM_ASSESSMENT_PROMPT = `You are an expert Product Management interview coach. Analyze the following PM interview transcript and provide a detailed assessment.

CRITICAL: ONLY evaluate content ACTUALLY in the transcript. Do NOT fabricate responses. If the candidate provided no substantive response, score ALL criteria 1/5. You must quote actual candidate text as evidence.

Score each criterion on a scale of 1-5:
- 1: Poor - Major gaps, needs significant improvement
- 2: Below Average - Some understanding but notable weaknesses
- 3: Average - Meets basic expectations
- 4: Good - Strong performance with minor areas to improve
- 5: Excellent - Outstanding, PM-ready

Criteria to evaluate:
1. Product Thinking (25%) - Did they deeply understand user needs, design thoughtful solutions, and define clear success metrics?
2. Communication (20%) - Was their delivery clear, structured, and persuasive?
3. User Empathy (15%) - Did they demonstrate deep understanding of user problems and behaviors?
4. Technical Depth (15%) - Did they show ability to reason about technical constraints and tradeoffs?
5. Analytical Skills (15%) - Were they comfortable with metrics, data, and quantitative reasoning?
6. Creativity (10%) - Did they show novel ideas and innovative approaches?

Respond in this exact JSON format:
{
  "overallScore": <number 1-5 with one decimal>,
  "scores": {
    "productThinking": <number 1-5>,
    "communication": <number 1-5>,
    "userEmpathy": <number 1-5>,
    "technicalDepth": <number 1-5>,
    "analyticalSkills": <number 1-5>,
    "creativity": <number 1-5>
  },
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"]
}`;

// Build the Product Sense specific assessment prompt with calibrated rubric and few-shot examples
function buildProductSensePrompt(): string {
  const rubricConfig = getRubricConfig("product-sense");
  if (!rubricConfig) {
    return PM_ASSESSMENT_PROMPT; // Fallback to generic PM prompt
  }

  const { rubric, calibratedExamples } = rubricConfig;

  // Build rubric section
  const rubricSection = rubric.dimensions
    .map((dim) => {
      const fiveStarCriteria = dim.scoringCriteria.find((c) => c.score === 5);
      return `### ${dim.name} (Weight: ${dim.weight}%)
${dim.description}

**5/5 Score Requirements:**
${fiveStarCriteria?.indicators.map((i) => `- ${i}`).join("\n") || ""}

**Common Issues:**
${dim.commonIssues.map((i) => `- ${i}`).join("\n")}`;
    })
    .join("\n\n");

  // Build few-shot examples section (use first 2 examples)
  const examplesSection = calibratedExamples
    .slice(0, 2)
    .map(
      (ex) => `### Example: ${ex.questionTitle} (${ex.company})

**Response Summary:**
${ex.transcriptSummary}

**Scores:**
${Object.entries(ex.scores)
  .map(([dim, score]) => `- ${formatDimensionName(dim)}: ${score}/5 - ${ex.scoreJustifications[dim]}`)
  .join("\n")}

**Overall Score:** ${ex.overallScore}/5

**Strengths:** ${ex.strengths.join(", ")}
**Areas for Improvement:** ${ex.improvements.join(", ")}`
    )
    .join("\n\n---\n\n");

  return `You are an expert Product Management interview coach specializing in Product Sense interviews.
Analyze the following interview transcript using the calibrated rubric below.

## CRITICAL SCORING RULES - READ FIRST

1. ONLY evaluate content that is ACTUALLY in the transcript - do NOT fabricate, assume, or invent any candidate responses
2. If the candidate provided NO substantive response or stayed silent, score ALL dimensions 1/5
3. If the transcript contains only the interviewer speaking with no meaningful candidate response, score ALL dimensions 1/5
4. You MUST quote specific text from the transcript as evidence for each score - if you cannot quote actual evidence from the candidate, the score must be 1/5
5. Do NOT assume the candidate said something they did not say
6. An empty or minimal response is NOT "meeting expectations" - it is a 1/5

## Scoring Scale
- 1 = Major gaps/issues (including: no response, minimal response, off-topic response)
- 2 = Below expectations
- 3 = Meets expectations (passing) - requires substantive, on-topic response
- 4 = Above expectations
- 5 = Exceptional

## Evaluation Framework

${rubricSection}

## Calibrated Examples (use these as scoring anchors)

${examplesSection}

## Scoring Instructions

1. Score each dimension independently on a 1-5 scale
2. Use the calibrated examples as anchors for what different scores look like
3. A score of 3/5 is passing - this REQUIRES the candidate to have provided substantive, relevant content
4. QUOTE specific evidence from the transcript for each score - if you cannot quote the candidate, score 1/5
5. If the candidate said nothing or gave minimal/irrelevant responses, ALL scores must be 1/5
6. Calculate overall score as weighted average: Product Motivation (20%) + Target Audience (25%) + Problem Identification (25%) + Solution Development (20%) + Communication Structure (10%)

Respond in this exact JSON format:
{
  "overallScore": <number 1-5 with one decimal>,
  "scores": {
    "productMotivation": <number 1-5>,
    "targetAudience": <number 1-5>,
    "problemIdentification": <number 1-5>,
    "solutionDevelopment": <number 1-5>,
    "communicationStructure": <number 1-5>
  },
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "dimensionFeedback": {
    "productMotivation": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "targetAudience": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "problemIdentification": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "solutionDevelopment": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "communicationStructure": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>"
  }
}`;
}

function formatDimensionName(dimensionId: string): string {
  const names: Record<string, string> = {
    // Product Sense dimensions
    productMotivation: "Product Motivation & Mission",
    targetAudience: "Target Audience",
    problemIdentification: "Problem Identification",
    solutionDevelopment: "Solution Development",
    communicationStructure: "Communication Structure",
    // Analytical Thinking dimensions
    productRationale: "Product Rationale",
    measuringImpact: "Measuring Impact",
    settingGoals: "Setting Goals",
    evaluatingTradeoffs: "Evaluating Tradeoffs",
  };
  return names[dimensionId] || dimensionId;
}

// Build the Analytical Thinking specific assessment prompt with calibrated rubric and few-shot examples
function buildAnalyticalThinkingPrompt(): string {
  const rubricConfig = getRubricConfig("analytical-thinking");
  if (!rubricConfig) {
    return PM_ASSESSMENT_PROMPT; // Fallback to generic PM prompt
  }

  const { rubric, calibratedExamples } = rubricConfig;

  // Build rubric section
  const rubricSection = rubric.dimensions
    .map((dim) => {
      const fiveStarCriteria = dim.scoringCriteria.find((c) => c.score === 5);
      return `### ${dim.name} (Weight: ${dim.weight}%)
${dim.description}

**5/5 Score Requirements:**
${fiveStarCriteria?.indicators.map((i) => `- ${i}`).join("\n") || ""}

**Common Issues:**
${dim.commonIssues.map((i) => `- ${i}`).join("\n")}`;
    })
    .join("\n\n");

  // Build few-shot examples section (use first 2 examples)
  const examplesSection = calibratedExamples
    .slice(0, 2)
    .map(
      (ex) => `### Example: ${ex.questionTitle} (${ex.company})

**Response Summary:**
${ex.transcriptSummary}

**Scores:**
${Object.entries(ex.scores)
  .map(([dim, score]) => `- ${formatDimensionName(dim)}: ${score}/5 - ${ex.scoreJustifications[dim]}`)
  .join("\n")}

**Overall Score:** ${ex.overallScore}/5

**Strengths:** ${ex.strengths.join(", ")}
**Areas for Improvement:** ${ex.improvements.join(", ")}`
    )
    .join("\n\n---\n\n");

  return `You are an expert Product Management interview coach specializing in Analytical Thinking (AT) interviews.
Analyze the following interview transcript using the calibrated rubric below.

## CRITICAL SCORING RULES - READ FIRST

1. ONLY evaluate content that is ACTUALLY in the transcript - do NOT fabricate, assume, or invent any candidate responses
2. If the candidate provided NO substantive response or stayed silent, score ALL dimensions 1/5
3. If the transcript contains only the interviewer speaking with no meaningful candidate response, score ALL dimensions 1/5
4. You MUST quote specific text from the transcript as evidence for each score - if you cannot quote actual evidence from the candidate, the score must be 1/5
5. Do NOT assume the candidate said something they did not say
6. An empty or minimal response is NOT "meeting expectations" - it is a 1/5

## Scoring Scale
- 1 = Major gaps/issues (including: no response, minimal response, off-topic response)
- 2 = Below expectations
- 3 = Meets expectations (passing) - requires substantive, on-topic response
- 4 = Above expectations
- 5 = Exceptional

## Evaluation Framework

${rubricSection}

## Calibrated Examples (use these as scoring anchors)

${examplesSection}

## Scoring Instructions

1. Score each dimension independently on a 1-5 scale
2. Use the calibrated examples as anchors for what different scores look like
3. A score of 3/5 is passing - this REQUIRES the candidate to have provided substantive, relevant content
4. QUOTE specific evidence from the transcript for each score - if you cannot quote the candidate, score 1/5
5. If the candidate said nothing or gave minimal/irrelevant responses, ALL scores must be 1/5
6. Calculate overall score as weighted average: Product Rationale (15%) + Measuring Impact (35%) + Setting Goals (25%) + Evaluating Tradeoffs (25%)

Respond in this exact JSON format:
{
  "overallScore": <number 1-5 with one decimal>,
  "scores": {
    "productRationale": <number 1-5>,
    "measuringImpact": <number 1-5>,
    "settingGoals": <number 1-5>,
    "evaluatingTradeoffs": <number 1-5>
  },
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "dimensionFeedback": {
    "productRationale": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "measuringImpact": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "settingGoals": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>",
    "evaluatingTradeoffs": "<quote what candidate said, then feedback. If candidate said nothing relevant, state 'No substantive response provided'>"
  }
}`;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, questionTitle, questionType, track } = await request.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    const isPM = track === "product-management";
    const isProductSense = isPM && questionType === "Product Sense";
    // Analytical Thinking detection - "Execution" type maps to AT assessment
    const isAnalyticalThinking = isPM && (questionType === "Analytical Thinking" || questionType === "Execution");

    // Select the appropriate prompt based on question type
    let assessmentPrompt: string;
    let assessmentSchema: "product-sense" | "analytical-thinking" | "pm-generic" | "consulting";

    if (isProductSense) {
      assessmentPrompt = buildProductSensePrompt();
      assessmentSchema = "product-sense";
    } else if (isAnalyticalThinking) {
      assessmentPrompt = buildAnalyticalThinkingPrompt();
      assessmentSchema = "analytical-thinking";
    } else if (isPM) {
      assessmentPrompt = PM_ASSESSMENT_PROMPT;
      assessmentSchema = "pm-generic";
    } else {
      assessmentPrompt = CONSULTING_ASSESSMENT_PROMPT;
      assessmentSchema = "consulting";
    }

    const interviewType = isProductSense
      ? "Product Sense Interview"
      : isAnalyticalThinking
        ? "Analytical Thinking Interview"
        : isPM
          ? "PM Interview"
          : "Case Interview";

    // Format transcript for the AI
    const formattedTranscript = transcript
      .map((entry: { role: string; text: string }) =>
        `${entry.role === "user" ? "Candidate" : "Interviewer"}: ${entry.text}`
      )
      .join("\n\n");

    // Check if candidate provided any substantive response
    const candidateUtterances = transcript.filter(
      (entry: { role: string; text: string }) => entry.role === "user" && entry.text.trim().length > 0
    );
    const totalCandidateWords = candidateUtterances.reduce(
      (sum: number, entry: { text: string }) => sum + entry.text.split(/\s+/).length,
      0
    );
    const hasSubstantiveResponse = totalCandidateWords > 20; // Less than 20 words is not substantive

    // Prepend warning for minimal responses
    const transcriptWarning = !hasSubstantiveResponse
      ? `\n\n**WARNING: The candidate provided minimal or no substantive response (only ${totalCandidateWords} words). All dimension scores should be 1/5.**\n\n`
      : "";

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
            content: assessmentPrompt,
          },
          {
            role: "user",
            content: `${interviewType} Assessment Request

Question: ${questionTitle}
Type: ${questionType}
${transcriptWarning}
Transcript:
${formattedTranscript}

Please provide your assessment in the specified JSON format. Remember: you must quote actual candidate responses as evidence. If the candidate said nothing substantive, all scores must be 1/5.`,
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
      // Add track and schema info to response for the frontend
      assessment.track = track || "consulting";
      assessment.assessmentSchema = assessmentSchema;

      // Save to calibration dataset for Product Sense and Analytical Thinking assessments
      if (assessmentSchema === "product-sense" || assessmentSchema === "analytical-thinking") {
        saveCalibrationTranscript({
          questionTitle,
          questionType,
          transcript,
          assessment,
          timestamp: new Date().toISOString(),
        }).catch((err) => {
          console.error("Failed to save calibration transcript:", err);
        });
      }

      return NextResponse.json(assessment);
    } catch (parseError) {
      console.error("Failed to parse assessment:", parseError, content);
      // Return a fallback assessment based on schema
      let fallbackScores;
      if (assessmentSchema === "product-sense") {
        fallbackScores = {
          productMotivation: 3,
          targetAudience: 3,
          problemIdentification: 3,
          solutionDevelopment: 3,
          communicationStructure: 3,
        };
      } else if (assessmentSchema === "analytical-thinking") {
        fallbackScores = {
          productRationale: 3,
          measuringImpact: 3,
          settingGoals: 3,
          evaluatingTradeoffs: 3,
        };
      } else if (assessmentSchema === "pm-generic") {
        fallbackScores = {
          productThinking: 3,
          communication: 3,
          userEmpathy: 3,
          technicalDepth: 3,
          analyticalSkills: 3,
          creativity: 3,
        };
      } else {
        fallbackScores = {
          structure: 3,
          problemSolving: 3,
          businessJudgment: 3,
          communication: 3,
          quantitative: 3,
          creativity: 3,
        };
      }
      return NextResponse.json({
        overallScore: 3.0,
        scores: fallbackScores,
        feedback: "Assessment could not be fully parsed. Please try again.",
        strengths: ["Completed the interview", "Engaged with the question"],
        improvements: ["Continue practicing", "Work on structure"],
        track: track || "consulting",
        assessmentSchema,
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
