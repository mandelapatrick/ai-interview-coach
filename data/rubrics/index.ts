import { RubricConfig } from "./types";
import { productSenseRubric, productSenseExamples } from "./product-sense";
import { analyticalThinkingRubric, analyticalThinkingExamples } from "./analytical-thinking";

const rubricRegistry: Record<string, RubricConfig> = {
  "product-sense": {
    rubric: productSenseRubric,
    calibratedExamples: productSenseExamples,
  },
  "analytical-thinking": {
    rubric: analyticalThinkingRubric,
    calibratedExamples: analyticalThinkingExamples,
  },
};

export function getRubricConfig(questionType: string): RubricConfig | null {
  return rubricRegistry[questionType] || null;
}

export function isProductSenseQuestion(questionType: string): boolean {
  return questionType === "product-sense";
}

export function isAnalyticalThinkingQuestion(questionType: string): boolean {
  // "execution" type questions map to analytical-thinking assessment
  return questionType === "analytical-thinking" || questionType === "execution";
}

export function hasCalibrationRubric(questionType: string): boolean {
  return questionType in rubricRegistry;
}

export { productSenseRubric, productSenseExamples };
export { analyticalThinkingRubric, analyticalThinkingExamples };
export type { RubricConfig, AssessmentRubric, RubricDimension, CalibratedExample } from "./types";
