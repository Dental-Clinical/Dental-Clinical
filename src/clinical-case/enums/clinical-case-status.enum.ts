export enum ClinicalCaseStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  DIAGNOSIS_PENDING_REVIEW = 'diagnosis_pending_review',
  // PENDING_SUPERVISOR_APPROVAL = 'pending_supervisor_approval', // for walk in cases
  TREATMENT_IN_PROGRESS = 'treatment_in_progress',
  AWAITING_CASE_REVIEW = 'awaiting_case_review',
  COMPLETED = 'completed',
}
