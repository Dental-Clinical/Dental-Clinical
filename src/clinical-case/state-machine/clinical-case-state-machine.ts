import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export const ClinicalCaseStateMachine: Record<
  ClinicalCaseStatus,
  ClinicalCaseStatus[]
> = {
  [ClinicalCaseStatus.OPEN]: [ClinicalCaseStatus.ASSIGNED],
  [ClinicalCaseStatus.ASSIGNED]: [ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW],
  [ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW]: [
    ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
  ],
  [ClinicalCaseStatus.TREATMENT_IN_PROGRESS]: [
    ClinicalCaseStatus.PROCEDURE_PENDING_REVIEW,
  ],
  [ClinicalCaseStatus.PROCEDURE_PENDING_REVIEW]: [ClinicalCaseStatus.COMPLETED],
  [ClinicalCaseStatus.COMPLETED]: [ClinicalCaseStatus.CLOSED],
  [ClinicalCaseStatus.CLOSED]: [],
};
