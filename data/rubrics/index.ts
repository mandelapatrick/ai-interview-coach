import { RubricConfig } from "./types";
import {
  productSenseRubric,
  productSenseExamples,
  analyticalThinkingRubric,
  analyticalThinkingExamples,
  behavioralRubric,
  behavioralExamples,
  technicalRubric,
  technicalExamples,
  strategyRubric,
  strategyExamples,
  estimationRubric,
  estimationExamples,
} from "./pm";

const rubricRegistry: Record<string, RubricConfig> = {
  "product-sense": {
    rubric: productSenseRubric,
    calibratedExamples: productSenseExamples,
  },
  "analytical-thinking": {
    rubric: analyticalThinkingRubric,
    calibratedExamples: analyticalThinkingExamples,
  },
  "behavioral": {
    rubric: behavioralRubric,
    calibratedExamples: behavioralExamples,
  },
  "technical": {
    rubric: technicalRubric,
    calibratedExamples: technicalExamples,
  },
  "strategy": {
    rubric: strategyRubric,
    calibratedExamples: strategyExamples,
  },
  "estimation": {
    rubric: estimationRubric,
    calibratedExamples: estimationExamples,
  },
};

export function getRubricConfig(questionType: string): RubricConfig | null {
  // "execution" type maps to analytical-thinking assessment
  if (questionType === "execution") {
    return rubricRegistry["analytical-thinking"] || null;
  }
  return rubricRegistry[questionType] || null;
}

export function isProductSenseQuestion(questionType: string): boolean {
  return questionType === "product-sense";
}

export function isAnalyticalThinkingQuestion(questionType: string): boolean {
  // "execution" type questions map to analytical-thinking assessment
  return questionType === "analytical-thinking" || questionType === "execution";
}

export function isBehavioralQuestion(questionType: string): boolean {
  return questionType === "behavioral";
}

export function isTechnicalQuestion(questionType: string): boolean {
  return questionType === "technical";
}

export function isStrategyQuestion(questionType: string): boolean {
  return questionType === "strategy";
}

export function isEstimationQuestion(questionType: string): boolean {
  return questionType === "estimation";
}

export function hasCalibrationRubric(questionType: string): boolean {
  // "execution" maps to analytical-thinking
  if (questionType === "execution") {
    return "analytical-thinking" in rubricRegistry;
  }
  return questionType in rubricRegistry;
}

// Re-export all rubrics and examples
export {
  productSenseRubric,
  productSenseExamples,
  analyticalThinkingRubric,
  analyticalThinkingExamples,
  behavioralRubric,
  behavioralExamples,
  technicalRubric,
  technicalExamples,
  strategyRubric,
  strategyExamples,
  estimationRubric,
  estimationExamples,
};

// Re-export types
export type { RubricConfig, AssessmentRubric, RubricDimension, CalibratedExample } from "./types";
