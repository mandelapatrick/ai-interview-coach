import { Question, QuestionType, QUESTION_TYPE_LABELS } from "@/types";
import { getConsultingBasePrompt, getConsultingClosingSections } from "./base";
import { FORMAT_INSTRUCTIONS, getDefaultFormat } from "./formats";
import { getConsultingTypePrompt } from "./types";

export { getConsultingBasePrompt, getConsultingClosingSections } from "./base";
export { FORMAT_INSTRUCTIONS, getDefaultFormat } from "./formats";
export { getConsultingTypePrompt } from "./types";

/**
 * Generate the complete system prompt for a consulting case interview
 */
export function getConsultingPrompt(question: Question): string {
  const format = question.interviewFormat || getDefaultFormat(question.companySlug);
  const industry = question.industry || "General Business";
  const caseType = QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS] || question.type;
  const typePrompt = getConsultingTypePrompt(question.type as QuestionType);

  let prompt = `${getConsultingBasePrompt()}

---

${FORMAT_INSTRUCTIONS[format]}

---

${typePrompt}

${getConsultingClosingSections()}

---

### Case Context
*   **Case Title:** ${question.title}
*   **Industry:** ${industry}
*   **Case Type:** ${caseType}
*   **Company Style:** ${question.companySlug}
*   **Interview Format:** ${format}
*   **Difficulty:** ${question.difficulty}
*   **Opening Prompt:** ${question.description}`;

  if (question.additionalInfo) {
    prompt += `
*   **Data/Exhibits:** ${question.additionalInfo}`;
  }

  if (question.solution) {
    prompt += `
*   **Solution Key (for your reference only - never reveal directly):** ${question.solution}`;
  }

  prompt += `

---

**Begin the interview now.** Start with a brief greeting, then present the case prompt to the candidate.`;

  return prompt;
}
