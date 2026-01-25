/**
 * Master Prompts Index
 * Coordinates all interview prompts for both practice and learn modes
 */

import { Question } from "@/types";
import { getConsultingPrompt } from "./practice/consulting";
import { getPMPrompt } from "./practice/pm";
import { getPMCandidatePrompt } from "./learn/pm";
import { getConsultingCandidatePrompt } from "./learn/consulting/candidate";

// Re-export practice mode functions
export {
  getConsultingPrompt,
  CONSULTING_SYSTEM_PROMPT,
  FORMAT_INSTRUCTIONS,
  getDefaultFormat,
} from "./practice/consulting";

export {
  getPMPrompt,
  getPMBasePrompt,
  getPMClosingSections,
} from "./practice/pm";

export * from "./practice/pm/types";

// Re-export learn mode functions
export { getPMCandidatePrompt, getCandidateTypePrompt } from "./learn/pm";
export * from "./learn/pm/types";
export { getConsultingCandidatePrompt } from "./learn/consulting/candidate";

/**
 * Main function to get the system prompt for practice mode (interviewer)
 * This is the primary export used by VoiceSession, VideoSession, and AnamAudioSession
 */
export function getSystemPrompt(question: Question): string {
  const isPM = question.track === "product-management";

  if (isPM) {
    return getPMPrompt(question);
  }

  // Default to consulting case interview
  return getConsultingPrompt(question);
}

/**
 * Main function to get the candidate prompt for learn mode
 * Routes to the appropriate type-specific prompt based on question track and type
 */
export function getCandidatePrompt(question: Question): string {
  const isPM = question.track === "product-management";

  if (isPM) {
    return getPMCandidatePrompt(question);
  }

  // Default to consulting candidate prompt
  return getConsultingCandidatePrompt(question);
}

/**
 * Legacy function signature for backwards compatibility
 */
export function getSystemPromptLegacy(
  type: Question["type"],
  questionTitle: string,
  questionDescription: string
): string {
  return getSystemPrompt({
    id: "",
    companySlug: "generic",
    title: questionTitle,
    type: type,
    difficulty: "medium",
    description: questionDescription,
    track: "consulting",
  });
}
