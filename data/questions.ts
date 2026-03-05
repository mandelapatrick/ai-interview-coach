import { Question, InterviewTrack } from "@/types";
import { pmQuestions } from "./pm-questions";
import { consultingQuestions } from "./consulting-questions";

// All questions (consulting + PM)
export const allQuestions: Question[] = [...consultingQuestions, ...pmQuestions];

// Re-export for backwards compatibility
export const questions = consultingQuestions;

export function getQuestionsByCompany(companySlug: string): Question[] {
  return allQuestions.filter((q) => q.companySlug === companySlug);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export function getQuestionsByTrack(track: InterviewTrack): Question[] {
  return allQuestions.filter((q) => q.track === track);
}
