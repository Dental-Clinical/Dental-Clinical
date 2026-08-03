import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';

/**
 * Linear ordering of the case lifecycle, derived from the same transitions the
 * runtime state machine allows. Stage seeders use it to decide whether they
 * apply to a scenario: a case targeting DIAGNOSIS_PENDING_REVIEW must carry
 * everything ASSIGNED requires, and nothing beyond its own stage.
 */
export const STAGE_ORDER: ClinicalCaseStatus[] = [
  ClinicalCaseStatus.OPEN,
  ClinicalCaseStatus.ASSIGNED,
  ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW,
  ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
  ClinicalCaseStatus.AWAITING_CASE_REVIEW,
  ClinicalCaseStatus.COMPLETED,
];

export function stageIndex(status: ClinicalCaseStatus): number {
  const index = STAGE_ORDER.indexOf(status);
  if (index < 0) {
    throw new Error(`Unknown clinical case status: ${status}`);
  }
  return index;
}

/** True when `target` is at or past `required` in the lifecycle. */
export function hasReached(
  target: ClinicalCaseStatus,
  required: ClinicalCaseStatus,
): boolean {
  return stageIndex(target) >= stageIndex(required);
}
