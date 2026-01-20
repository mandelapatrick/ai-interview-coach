// Rubric dimension definition
export interface RubricDimension {
  id: string;
  name: string;
  weight: number; // Percentage (e.g., 25 for 25%)
  description: string;
  scoringCriteria: {
    score: number; // 1-5
    description: string;
    indicators: string[];
  }[];
  commonIssues: string[];
}

// Complete rubric for a question type
export interface AssessmentRubric {
  questionType: string; // e.g., "product-sense"
  dimensions: RubricDimension[];
  passingScore: number; // e.g., 3
  maxScore: number; // e.g., 5
}

// Calibrated example for few-shot prompting
export interface CalibratedExample {
  id: string;
  questionTitle: string;
  company: string;
  transcriptSummary: string; // Condensed version for prompt
  scores: Record<string, number>; // dimension_id -> score
  overallScore: number;
  scoreJustifications: Record<string, string>; // dimension_id -> justification
  strengths: string[];
  improvements: string[];
}

// Complete rubric configuration with examples
export interface RubricConfig {
  rubric: AssessmentRubric;
  calibratedExamples: CalibratedExample[];
}
