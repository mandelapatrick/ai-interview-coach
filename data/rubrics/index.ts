import { RubricConfig } from "./types";
import { productSenseRubric, productSenseExamples } from "./product-sense";

const rubricRegistry: Record<string, RubricConfig> = {
  "product-sense": {
    rubric: productSenseRubric,
    calibratedExamples: productSenseExamples,
  },
};

export function getRubricConfig(questionType: string): RubricConfig | null {
  return rubricRegistry[questionType] || null;
}

export function isProductSenseQuestion(questionType: string): boolean {
  return questionType === "product-sense";
}

export function hasCalibrationRubric(questionType: string): boolean {
  return questionType in rubricRegistry;
}

export { productSenseRubric, productSenseExamples };
export type { RubricConfig, AssessmentRubric, RubricDimension, CalibratedExample } from "./types";
