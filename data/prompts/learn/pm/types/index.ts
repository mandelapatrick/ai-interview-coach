/**
 * Learn Mode PM Type Prompts - Index
 * Dispatches to type-specific candidate prompts
 */

import { Question, PMQuestionType } from "@/types";
import { getProductSenseCandidatePrompt } from "./product-sense";
import { getAnalyticalThinkingCandidatePrompt } from "./analytical-thinking";
import { getBehavioralCandidatePrompt } from "./behavioral";
import { getTechnicalCandidatePrompt } from "./technical";
import { getStrategyCandidatePrompt } from "./strategy";
import { getEstimationCandidatePrompt } from "./estimation";

export { getProductSenseCandidatePrompt } from "./product-sense";
export { getAnalyticalThinkingCandidatePrompt } from "./analytical-thinking";
export { getBehavioralCandidatePrompt } from "./behavioral";
export { getTechnicalCandidatePrompt } from "./technical";
export { getStrategyCandidatePrompt } from "./strategy";
export { getEstimationCandidatePrompt } from "./estimation";

/**
 * Get the type-specific candidate prompt for learn mode
 */
export function getCandidateTypePrompt(question: Question): string {
  const questionType = question.type as PMQuestionType;

  switch (questionType) {
    case "product-sense":
      return getProductSenseCandidatePrompt(question);
    case "analytical-thinking":
    case "execution":
      return getAnalyticalThinkingCandidatePrompt(question);
    case "behavioral":
      return getBehavioralCandidatePrompt(question);
    case "technical":
      return getTechnicalCandidatePrompt(question);
    case "strategy":
      return getStrategyCandidatePrompt(question);
    case "estimation":
      return getEstimationCandidatePrompt(question);
    default:
      // Default to product sense for unknown types
      return getProductSenseCandidatePrompt(question);
  }
}
