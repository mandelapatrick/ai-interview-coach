/**
 * Consulting Question Type Prompts - Index
 * Re-exports all type-specific prompts
 */

export { PROFITABILITY_PROMPT } from "./profitability";
export { MARKET_ENTRY_PROMPT } from "./market-entry";
export { MARKET_SIZING_PROMPT } from "./market-sizing";
export { M_AND_A_PROMPT } from "./m-and-a";
export { OPERATIONS_PROMPT } from "./operations";
export { GROWTH_STRATEGY_PROMPT } from "./growth-strategy";
export { PRICING_PROMPT } from "./pricing";
export { STRATEGIC_DECISION_PROMPT } from "./strategic-decision";
export { INDUSTRY_ANALYSIS_PROMPT } from "./industry-analysis";
export { COMPETITIVE_RESPONSE_PROMPT } from "./competitive-response";

import { QuestionType } from "@/types";
import { PROFITABILITY_PROMPT } from "./profitability";
import { MARKET_ENTRY_PROMPT } from "./market-entry";
import { MARKET_SIZING_PROMPT } from "./market-sizing";
import { M_AND_A_PROMPT } from "./m-and-a";
import { OPERATIONS_PROMPT } from "./operations";
import { GROWTH_STRATEGY_PROMPT } from "./growth-strategy";
import { PRICING_PROMPT } from "./pricing";
import { STRATEGIC_DECISION_PROMPT } from "./strategic-decision";
import { INDUSTRY_ANALYSIS_PROMPT } from "./industry-analysis";
import { COMPETITIVE_RESPONSE_PROMPT } from "./competitive-response";

/**
 * Get the type-specific prompt for a consulting question type
 */
export function getConsultingTypePrompt(questionType: QuestionType): string {
  switch (questionType) {
    case "profitability":
      return PROFITABILITY_PROMPT;
    case "market-entry":
      return MARKET_ENTRY_PROMPT;
    case "market-sizing":
      return MARKET_SIZING_PROMPT;
    case "m&a":
      return M_AND_A_PROMPT;
    case "operations":
      return OPERATIONS_PROMPT;
    case "growth-strategy":
      return GROWTH_STRATEGY_PROMPT;
    case "pricing":
      return PRICING_PROMPT;
    case "strategic-decision":
      return STRATEGIC_DECISION_PROMPT;
    case "industry-analysis":
      return INDUSTRY_ANALYSIS_PROMPT;
    case "competitive-response":
      return COMPETITIVE_RESPONSE_PROMPT;
    default:
      // Fallback to profitability for unknown types (brainteasers, turnarounds, etc.)
      return PROFITABILITY_PROMPT;
  }
}
