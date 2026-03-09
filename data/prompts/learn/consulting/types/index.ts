/**
 * Learn Mode Consulting Type Prompts - Index
 * Dispatches to type-specific candidate prompts
 */

import { Question, QuestionType } from "@/types";
import { getProfitabilityCandidatePrompt } from "./profitability";
import { getMarketEntryCandidatePrompt } from "./market-entry";
import { getMarketSizingCandidatePrompt } from "./market-sizing";
import { getMANCandidatePrompt } from "./m-and-a";
import { getOperationsCandidatePrompt } from "./operations";
import { getGrowthStrategyCandidatePrompt } from "./growth-strategy";
import { getPricingCandidatePrompt } from "./pricing";
import { getStrategicDecisionCandidatePrompt } from "./strategic-decision";
import { getIndustryAnalysisCandidatePrompt } from "./industry-analysis";
import { getCompetitiveResponseCandidatePrompt } from "./competitive-response";

export { getProfitabilityCandidatePrompt } from "./profitability";
export { getMarketEntryCandidatePrompt } from "./market-entry";
export { getMarketSizingCandidatePrompt } from "./market-sizing";
export { getMANCandidatePrompt } from "./m-and-a";
export { getOperationsCandidatePrompt } from "./operations";
export { getGrowthStrategyCandidatePrompt } from "./growth-strategy";
export { getPricingCandidatePrompt } from "./pricing";
export { getStrategicDecisionCandidatePrompt } from "./strategic-decision";
export { getIndustryAnalysisCandidatePrompt } from "./industry-analysis";
export { getCompetitiveResponseCandidatePrompt } from "./competitive-response";

/**
 * Get the type-specific candidate prompt for consulting learn mode
 */
export function getCandidateTypePrompt(question: Question): string {
  const questionType = question.type as QuestionType;

  switch (questionType) {
    case "profitability":
      return getProfitabilityCandidatePrompt(question);
    case "market-entry":
      return getMarketEntryCandidatePrompt(question);
    case "market-sizing":
      return getMarketSizingCandidatePrompt(question);
    case "m&a":
      return getMANCandidatePrompt(question);
    case "operations":
      return getOperationsCandidatePrompt(question);
    case "growth-strategy":
      return getGrowthStrategyCandidatePrompt(question);
    case "pricing":
      return getPricingCandidatePrompt(question);
    case "strategic-decision":
      return getStrategicDecisionCandidatePrompt(question);
    case "industry-analysis":
      return getIndustryAnalysisCandidatePrompt(question);
    case "competitive-response":
      return getCompetitiveResponseCandidatePrompt(question);
    // Fallback types — map to profitability (matching practice mode behavior)
    case "brainteasers":
    case "turnarounds":
      return getProfitabilityCandidatePrompt(question);
    default:
      // Default to profitability for unknown types
      return getProfitabilityCandidatePrompt(question);
  }
}
