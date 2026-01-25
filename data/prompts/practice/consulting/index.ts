import { Question, QUESTION_TYPE_LABELS } from "@/types";
import { CONSULTING_SYSTEM_PROMPT } from "./base";
import { FORMAT_INSTRUCTIONS, getDefaultFormat } from "./formats";

export { CONSULTING_SYSTEM_PROMPT } from "./base";
export { FORMAT_INSTRUCTIONS, getDefaultFormat } from "./formats";

/**
 * Generate the complete system prompt for a consulting case interview
 */
export function getConsultingPrompt(question: Question): string {
  const format = question.interviewFormat || getDefaultFormat(question.companySlug);
  const industry = question.industry || "General Business";
  const caseType = QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS] || question.type;

  let prompt = `${CONSULTING_SYSTEM_PROMPT}

---

${FORMAT_INSTRUCTIONS[format]}

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
