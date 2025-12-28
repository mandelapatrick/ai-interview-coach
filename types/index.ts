export type QuestionType =
  | "profitability"
  | "market-entry"
  | "market-sizing"
  | "m&a"
  | "operations"
  | "growth-strategy"
  | "pricing"
  | "competitive-response";

export type Difficulty = "easy" | "medium" | "hard";

export interface Company {
  slug: string;
  name: string;
  logo: string;
  description: string;
  questionCount: number;
}

export interface Question {
  id: string;
  companySlug: string;
  title: string;
  type: QuestionType;
  difficulty: Difficulty;
  description: string;
}

export interface Session {
  id: string;
  userId: string;
  questionId: string;
  transcript: string;
  durationSeconds: number;
  createdAt: Date;
}

export interface Assessment {
  id: string;
  sessionId: string;
  overallScore: number;
  structureScore: number;
  problemSolvingScore: number;
  businessJudgmentScore: number;
  communicationScore: number;
  quantitativeScore: number;
  creativityScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  profitability: "Profitability",
  "market-entry": "Market Entry",
  "market-sizing": "Market Sizing",
  "m&a": "M&A",
  operations: "Operations",
  "growth-strategy": "Growth Strategy",
  pricing: "Pricing",
  "competitive-response": "Competitive Response",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50",
  hard: "text-red-600 bg-red-50",
};

export const TYPE_COLORS: Record<QuestionType, string> = {
  profitability: "text-blue-600 bg-blue-50",
  "market-entry": "text-purple-600 bg-purple-50",
  "market-sizing": "text-cyan-600 bg-cyan-50",
  "m&a": "text-orange-600 bg-orange-50",
  operations: "text-gray-600 bg-gray-100",
  "growth-strategy": "text-emerald-600 bg-emerald-50",
  pricing: "text-pink-600 bg-pink-50",
  "competitive-response": "text-indigo-600 bg-indigo-50",
};
