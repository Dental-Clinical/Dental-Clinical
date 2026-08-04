import { UserRole } from 'src/constants/user-roles';

/**
 * The actors allowed to open a clinical case's details view.
 * Each has its own ownership filter and its own visible slice of the payload.
 */
export type CaseViewerRole =
  UserRole.STUDENT | UserRole.PATIENT | UserRole.SUPERVISOR;

export interface CaseViewPolicy {
  /** patientName / patientId / patientAge / patientGender in caseInfo */
  includePatientIdentity: boolean;
  /** caseInfo.treatingStudent */
  includeTreatingStudent: boolean;
  /** the root supervisorNotes[] — internal feedback about the student */
  includeSupervisorNotes: boolean;
}

export const CASE_VIEW_POLICY: Record<CaseViewerRole, CaseViewPolicy> = {
  [UserRole.STUDENT]: {
    includePatientIdentity: true,
    includeTreatingStudent: false,
    includeSupervisorNotes: true,
  },
  [UserRole.PATIENT]: {
    includePatientIdentity: false,
    includeTreatingStudent: true,
    includeSupervisorNotes: false,
  },
  [UserRole.SUPERVISOR]: {
    includePatientIdentity: true,
    includeTreatingStudent: true,
    includeSupervisorNotes: true,
  },
};
