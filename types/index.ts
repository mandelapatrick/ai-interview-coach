export type InterviewFormat =
  | "candidate-led"   // Typical of Bain, BCG, LEK. User drives the structure.
  | "interviewer-led"; // Typical of McKinsey. AI drives with specific questions.

export type InterviewTrack = "consulting" | "product-management";

export type QuestionType =
  | "profitability"        // Revenue/Cost analysis
  | "market-entry"         // New geography or product launch
  | "market-sizing"        // Estimation/Guesstimates
  | "m&a"                  // Mergers & Acquisitions
  | "operations"           // Efficiency, supply chain, bottlenecks
  | "growth-strategy"      // Increasing revenue/share
  | "pricing"              // Cost-based, Competitive, Value-based
  | "competitive-response" // Reacting to a rival's move (e.g., price war)
  | "brainteasers"         // Lateral thinking riddles
  | "turnarounds"          // Saving a failing company
  | "strategic-decision"   // Go/No-Go decisions (e.g., build a plant)
  | "industry-analysis";   // Porter's 5 Forces/Landscape assessment

export type PMQuestionType =
  | "product-sense"   // Product design questions
  | "behavioral"      // Leadership & Drive, STAR method
  | "technical"       // System design, architecture
  | "execution"       // Metrics, Analytics
  | "strategy"        // Market analysis, competitive positioning
  | "estimation";     // Market sizing, capacity planning

export type AllQuestionTypes = QuestionType | PMQuestionType;

export type Difficulty = "easy" | "medium" | "hard";

export interface Company {
  slug: string;
  name: string;
  logo: string;
  logoUrl?: string;
  description: string;
  questionCount: number;
  categories: string[];
  track: InterviewTrack;
}

export interface Question {
  id: string;
  companySlug: string;
  title: string;
  type: AllQuestionTypes;
  difficulty: Difficulty;
  description: string;
  track: InterviewTrack;
  // New fields for enhanced case interviews
  industry?: string;
  interviewFormat?: InterviewFormat;
  additionalInfo?: string;        // Data/exhibits for the case
  additionalInfoImages?: string[]; // Image URLs for charts/exhibits
  solution?: string;              // Solution key for interviewer reference
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
  brainteasers: "Brainteasers",
  turnarounds: "Turnarounds",
  "strategic-decision": "Strategic Decision",
  "industry-analysis": "Industry Analysis",
};

export const INTERVIEW_FORMAT_LABELS: Record<InterviewFormat, string> = {
  "candidate-led": "Candidate-Led",
  "interviewer-led": "Interviewer-Led",
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
  brainteasers: "text-yellow-600 bg-yellow-50",
  turnarounds: "text-red-600 bg-red-50",
  "strategic-decision": "text-teal-600 bg-teal-50",
  "industry-analysis": "text-slate-600 bg-slate-50",
};

// PM Interview Types
export const PM_QUESTION_TYPE_LABELS: Record<PMQuestionType, string> = {
  "product-sense": "Product Sense",
  behavioral: "Behavioral",
  technical: "Technical",
  execution: "Execution",
  strategy: "Strategy",
  estimation: "Estimation",
};

export const PM_TYPE_COLORS: Record<PMQuestionType, string> = {
  "product-sense": "text-violet-600 bg-violet-50",
  behavioral: "text-amber-600 bg-amber-50",
  technical: "text-blue-600 bg-blue-50",
  execution: "text-teal-600 bg-teal-50",
  strategy: "text-rose-600 bg-rose-50",
  estimation: "text-indigo-600 bg-indigo-50",
};

// Dark background variants for PM types
export const PM_TYPE_COLORS_DARK: Record<PMQuestionType, string> = {
  "product-sense": "text-violet-400 bg-violet-400/10",
  behavioral: "text-amber-400 bg-amber-400/10",
  technical: "text-blue-400 bg-blue-400/10",
  execution: "text-teal-400 bg-teal-400/10",
  strategy: "text-rose-400 bg-rose-400/10",
  estimation: "text-indigo-400 bg-indigo-400/10",
};

// Dark background variants for consulting types
export const TYPE_COLORS_DARK: Record<QuestionType, string> = {
  profitability: "text-blue-400 bg-blue-400/10",
  "market-entry": "text-purple-400 bg-purple-400/10",
  "market-sizing": "text-cyan-400 bg-cyan-400/10",
  "m&a": "text-orange-400 bg-orange-400/10",
  operations: "text-gray-400 bg-gray-400/10",
  "growth-strategy": "text-emerald-400 bg-emerald-400/10",
  pricing: "text-pink-400 bg-pink-400/10",
  "competitive-response": "text-indigo-400 bg-indigo-400/10",
  brainteasers: "text-yellow-400 bg-yellow-400/10",
  turnarounds: "text-red-400 bg-red-400/10",
  "strategic-decision": "text-teal-400 bg-teal-400/10",
  "industry-analysis": "text-slate-400 bg-slate-400/10",
};
