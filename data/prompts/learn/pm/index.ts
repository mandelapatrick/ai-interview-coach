/**
 * Learn Mode PM Prompts - Index
 * Coordinates all PM candidate prompts for learn mode
 * Assembles: Base + Type-Specific + Closing sections
 */

import { Question } from "@/types";
import { getCandidateBasePrompt, getCandidateClosingSections } from "./base";
import { getCandidateTypePrompt } from "./types";

// Re-export base functions
export { getCandidateBasePrompt, getCandidateClosingSections } from "./base";

// Re-export from types
export { getCandidateTypePrompt } from "./types";
export * from "./types";

/**
 * Get the complete candidate prompt for a PM question in learn mode
 * Assembles: Base (Role + Personality) + Type-Specific (Context + Flow + Phrases) + Closing (Instructions + Pronunciations + Safety)
 */
export function getPMCandidatePrompt(question: Question): string {
  const typePrompt = getCandidateTypePrompt(question);

  return `${getCandidateBasePrompt()}

---

${typePrompt}

${getCandidateClosingSections()}`;
}
