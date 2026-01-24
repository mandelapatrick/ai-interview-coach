import { Question, PM_QUESTION_TYPE_LABELS, PMQuestionType } from "@/types";
import { getPMBasePrompt, getPMClosingSections } from "./base";
import { getTypePrompt } from "./types";

export { getPMBasePrompt, getPMClosingSections } from "./base";
export * from "./types";

/**
 * Generate the complete system prompt for a PM interview
 */
export function getPMPrompt(question: Question): string {
  const questionType = PM_QUESTION_TYPE_LABELS[question.type as PMQuestionType] || question.type;
  const typePrompt = getTypePrompt(question.type as PMQuestionType);

  let prompt = `${getPMBasePrompt()}

---

${typePrompt}

${getPMClosingSections()}

---

### Question Context
*   **Question:** ${question.title}
*   **Question Type:** ${questionType}
*   **Company:** ${question.companySlug}
*   **Difficulty:** ${question.difficulty}
*   **Full Prompt:** ${question.description}`;

  if (question.additionalInfo) {
    prompt += `
*   **Additional Context:** ${question.additionalInfo}`;
  }

  if (question.solution) {
    prompt += `
*   **Key Points to Cover (for your reference only - never reveal directly):** ${question.solution}`;
  }

  prompt += `

---

**Begin the interview now.** Start with a brief introduction, then present the question to the candidate.`;

  return prompt;
}
