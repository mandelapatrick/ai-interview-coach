/**
 * Learn Mode PM Prompts - Index
 * Coordinates all PM candidate prompts for learn mode
 */

import { Question } from "@/types";
import { getCandidateTypePrompt } from "./types";

export { getCandidateTypePrompt } from "./types";
export * from "./types";

/**
 * Get the complete candidate prompt for a PM question in learn mode
 */
export function getPMCandidatePrompt(question: Question): string {
  return getCandidateTypePrompt(question);
}
