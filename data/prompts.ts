import { QuestionType } from "@/types";
import masterPrompt from "./prompts_json/masterPrompt.json";
import questionTypePrompts from "./prompts_json/questionTypePrompts.json";

const BASE_PROMPT = masterPrompt.content;

const TYPE_PROMPTS = questionTypePrompts as Record<QuestionType, { role: string; content: string }>;

export function getSystemPrompt(
  type: QuestionType,
  questionTitle: string,
  questionDescription: string
): string {
  const typePrompt = TYPE_PROMPTS[type]?.content || "";

  return `${BASE_PROMPT}

${typePrompt}

**Case Details:**
Title: ${questionTitle}
Prompt: ${questionDescription}

Begin the interview now. Start by presenting the case prompt to the candidate.`;
}
