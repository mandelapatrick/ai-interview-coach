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

  if (question.additionalInfoImages && question.additionalInfoImages.length > 0) {
    const n = question.additionalInfoImages.length;
    prompt += `
*   **Exhibits Available:** ${n} locked exhibit(s) visible to the candidate as blurred thumbnails. The candidate cannot access them until you unlock them.
*   **Exhibit Unlock Trigger:** To unlock an exhibit, say exactly "Take a look at Exhibit N" (e.g., "Take a look at Exhibit 1"). This phrase triggers the system to unlock and display the exhibit to the candidate.
*   **Exhibit Timing:** Do NOT present all exhibits at once. Reveal each exhibit at the moment it becomes relevant to the analysis. ${
      format === "interviewer-led"
        ? "Proactively present exhibits at the appropriate phase of your guided analysis."
        : "When the candidate asks for data that matches an exhibit, unlock it for them."
    }`;
  }

  if (question.additionalQuestions && question.additionalQuestions.length > 0) {
    prompt += `
*   **Follow-up Questions:** ${question.additionalQuestions.join(" | ")}`;
  }

  if (question.solution) {
    prompt += `
*   **Solution Key (for your reference only - never reveal directly):** ${question.solution}`;
  }

  prompt += `

---

**Begin the interview now.** Start with a brief greeting, then present the case prompt to the candidate. After the case prompt, keep all responses to 1-2 short sentences. Answer clarifying questions directly without restating or adding commentary.`;

  return prompt;
}
