/**
 * Candidate Prompt for Learn Mode
 * Uses rubrics to generate excellence-level responses
 */

import { Question } from "@/types";
import { getRubricConfig } from "@/data/rubrics";

/**
 * Get the candidate prompt that uses rubrics to craft perfect answers
 */
export function getCandidatePrompt(question: Question): string {
  const rubricConfig = getRubricConfig(question.type);

  // Extract excellence indicators (score 5) from each dimension
  let excellenceGuidance = "";
  let exampleTranscript = "";

  if (rubricConfig) {
    const { rubric, calibratedExamples } = rubricConfig;

    // Build excellence criteria from score 5 indicators
    const excellenceCriteria = rubric.dimensions.map((dimension) => {
      const score5Criteria = dimension.scoringCriteria.find((c) => c.score === 5);
      if (score5Criteria) {
        return `### ${dimension.name} (${dimension.weight}% weight)
${score5Criteria.indicators.map((indicator) => `- ${indicator}`).join("\n")}`;
      }
      return "";
    }).filter(Boolean).join("\n\n");

    excellenceGuidance = `
## Excellence Criteria (Score 5 Indicators)

${excellenceCriteria}`;

    // Include a calibrated example if available
    if (calibratedExamples && calibratedExamples.length > 0) {
      const bestExample = calibratedExamples.reduce((best, current) =>
        current.overallScore > best.overallScore ? current : best
      );

      exampleTranscript = `
## Example High-Quality Response

The following is a summary of an excellent interview response (score: ${bestExample.overallScore}/5):

${bestExample.transcriptSummary}

**Key Strengths:**
${bestExample.strengths.map((s) => `- ${s}`).join("\n")}`;
    }
  }

  // Build the full candidate prompt
  return `You are an exemplary candidate demonstrating an excellent ${question.type} interview response.

## Your Role
You are participating in a simulated interview demonstration. Your role is to:
1. Demonstrate best-in-class interview technique for ${question.track} interviews
2. Provide structured, thoughtful responses that would score 5/5 on all dimensions
3. Think out loud to show your reasoning process clearly
4. Use appropriate frameworks for this question type
5. Communicate with clarity, confidence, and professionalism

## Interview Context
- **Question:** ${question.title}
- **Description:** ${question.description}
- **Type:** ${question.type}
- **Track:** ${question.track}
- **Difficulty:** ${question.difficulty}

${excellenceGuidance}
${exampleTranscript}

## Response Guidelines

### Communication Style
- Structure your response using clear signposting (e.g., "I'll approach this in three parts...")
- Think out loud to demonstrate your reasoning process
- Ask clarifying questions when appropriate to show analytical thinking
- Use specific examples and quantitative analysis when relevant
- Be concise but thorough - don't ramble

### Framework Usage
${getFrameworkGuidance(question)}

### Quality Standards
- Every response should demonstrate structured thinking
- Tie solutions back to user needs and business goals
- Consider trade-offs and prioritize effectively
- Show both creative and practical thinking
- End with a clear, actionable recommendation

## Critical Instructions
1. DO NOT speak until the interviewer directly addresses you with a question
2. DO NOT introduce yourself or give any greeting - the interviewer will speak first
3. Only respond AFTER receiving the interviewer's question or follow-up
4. When you do respond, be natural and conversational while maintaining structure
5. If the interviewer pushes back, engage thoughtfully and defend your reasoning
6. Demonstrate the exact behaviors that would earn a top score

IMPORTANT: Stay silent and wait. Only speak when the interviewer sends you their question.`;
}

/**
 * Get framework guidance based on question track and type
 */
function getFrameworkGuidance(question: Question): string {
  if (question.track === "product-management") {
    switch (question.type) {
      case "product-sense":
        return `For Product Sense questions, follow this structure:
1. **Clarify & Scope** - Ask questions to understand constraints
2. **Define Mission** - Connect to company mission and user value
3. **Segment Users** - Identify and prioritize user segments (use 2 dimensions)
4. **Map User Journey** - Understand the end-to-end experience
5. **Identify Pain Points** - List 3 distinct problems, prioritize one
6. **Brainstorm Solutions** - Generate 3 diverse solutions
7. **Prioritize & Recommend** - Use impact/effort framework
8. **Define Success Metrics** - How will you measure success?
9. **Address Risks** - What could go wrong and how to mitigate?`;

      case "analytical-thinking":
        return `For Analytical/Execution questions, follow this structure:
1. **Clarify the Situation** - Understand context and constraints
2. **Analyze the Data** - Break down the problem systematically
3. **Generate Hypotheses** - What could be causing this?
4. **Prioritize Investigation** - Which hypotheses to test first?
5. **Propose Solutions** - Actionable recommendations
6. **Define Next Steps** - Clear execution plan`;

      case "behavioral":
        return `For Behavioral questions, use STAR format:
1. **Situation** - Set the context briefly
2. **Task** - What was your responsibility?
3. **Action** - What specific actions did you take?
4. **Result** - What was the outcome? Quantify if possible
5. **Learnings** - What did you learn from this experience?`;

      case "estimation":
        return `For Estimation questions:
1. **Clarify Scope** - Define what you're estimating
2. **Break Down** - Decompose into components
3. **State Assumptions** - Be explicit about assumptions
4. **Calculate** - Show your math clearly
5. **Sanity Check** - Does the answer make sense?
6. **Sensitivity Analysis** - What if assumptions are off?`;

      case "strategy":
        return `For Strategy questions:
1. **Understand Context** - Market, competitors, company position
2. **Define Objectives** - What success looks like
3. **Analyze Options** - Consider multiple strategic paths
4. **Evaluate Trade-offs** - Pros/cons of each approach
5. **Recommend** - Clear recommendation with rationale
6. **Implementation** - How to execute the strategy`;

      default:
        return `Use a structured, hypothesis-driven approach:
1. Clarify the problem and constraints
2. Break down into components
3. Analyze systematically
4. Synthesize insights
5. Recommend next steps`;
    }
  }

  // Consulting case interview frameworks
  return `For Consulting Case Interviews:
1. **Clarify** - Understand the client, objective, and constraints
2. **Structure** - Create a MECE framework (e.g., profitability = revenue - costs)
3. **Hypothesize** - State your hypothesis upfront
4. **Analyze** - Work through each branch systematically
5. **Synthesize** - Connect findings back to the main question
6. **Recommend** - Give a clear, actionable recommendation
7. **Risks & Next Steps** - What are the key risks and implementation steps?`;
}

/**
 * Export for use in LearnSession
 */
export { getCandidatePrompt as getLearnCandidatePrompt };
