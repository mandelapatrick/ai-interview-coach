/**
 * PM Question Type Prompts - Index
 * Re-exports all type-specific prompts
 */

export { PRODUCT_SENSE_PROMPT } from "./product-sense";
export { ANALYTICAL_THINKING_PROMPT } from "./analytical-thinking";
export { BEHAVIORAL_PROMPT } from "./behavioral";
export { TECHNICAL_PROMPT } from "./technical";
export { STRATEGY_PROMPT } from "./strategy";
export { ESTIMATION_PROMPT } from "./estimation";

import { PMQuestionType } from "@/types";
import { PRODUCT_SENSE_PROMPT } from "./product-sense";
import { ANALYTICAL_THINKING_PROMPT } from "./analytical-thinking";
import { BEHAVIORAL_PROMPT } from "./behavioral";
import { TECHNICAL_PROMPT } from "./technical";
import { STRATEGY_PROMPT } from "./strategy";
import { ESTIMATION_PROMPT } from "./estimation";

/**
 * Get the type-specific prompt for a PM question type
 */
export function getTypePrompt(questionType: PMQuestionType): string {
  switch (questionType) {
    case "product-sense":
      return PRODUCT_SENSE_PROMPT;
    case "analytical-thinking":
    case "execution": // execution maps to analytical-thinking
      return ANALYTICAL_THINKING_PROMPT;
    case "behavioral":
      return BEHAVIORAL_PROMPT;
    case "technical":
      return TECHNICAL_PROMPT;
    case "strategy":
      return STRATEGY_PROMPT;
    case "estimation":
      return ESTIMATION_PROMPT;
    default:
      // Default to product sense for unknown types
      return PRODUCT_SENSE_PROMPT;
  }
}
