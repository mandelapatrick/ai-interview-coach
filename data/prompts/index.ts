/**
 * Master Prompts Index
 * Coordinates all interview prompts and exports the main getSystemPrompt function
 */

import { Question } from "@/types";
import { getConsultingPrompt } from "./consulting";
import { getPMPrompt } from "./pm";

// Re-export sub-module functions for direct access
export { getConsultingPrompt, CONSULTING_SYSTEM_PROMPT, FORMAT_INSTRUCTIONS, getDefaultFormat } from "./consulting";
export { getPMPrompt, getPMBasePrompt, getPMClosingSections } from "./pm";
export * from "./pm/types";

/**
 * Main function to get the system prompt for any interview question
 * This is the primary export used by VoiceSession, VideoSession, and AnamAudioSession
 */
export function getSystemPrompt(question: Question): string {
  // Check if this is a PM question
  const isPM = question.track === "product-management";

  if (isPM) {
    return getPMPrompt(question);
  }

  // Default to consulting case interview
  return getConsultingPrompt(question);
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
