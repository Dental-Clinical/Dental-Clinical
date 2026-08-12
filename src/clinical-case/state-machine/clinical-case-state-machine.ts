import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export const ClinicalCaseStateMachine: Record<
  ClinicalCaseStatus,
  ClinicalCaseStatus[]
> = {
  [ClinicalCaseStatus.OPEN]: [ClinicalCaseStatus.ASSIGNED],
  [ClinicalCaseStatus.ASSIGNED]: [ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW],
  [ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW]: [
    ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
    // The reviewing supervisor can move the case to another subject, which
    // discards the pending diagnosis and reopens the case.
    ClinicalCaseStatus.OPEN,
  ],
  [ClinicalCaseStatus.TREATMENT_IN_PROGRESS]: [
    ClinicalCaseStatus.AWAITING_CASE_REVIEW,
  ],
  [ClinicalCaseStatus.AWAITING_CASE_REVIEW]: [ClinicalCaseStatus.COMPLETED],
  [ClinicalCaseStatus.COMPLETED]: [],
};
