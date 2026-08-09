import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { ExaminationAppointmentStatus } from 'src/examination-requests/Enums/examination-appointment.enum';
import { Grade } from 'src/clinical-case-evaluation/enums/grade.enum';
import { InitialExaminationStatus } from 'src/initial-examination/enums/initial-examination-status.enum';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';
import { MediaBlueprint } from '../support/media.helper';

/**
 * A clinical scenario, declared as data.
 *
 * Everything the seeders do is a projection of this structure, which is why the
 * dataset can be reviewed by a clinician who has never opened the code: the
 * blueprint reads as a case description, not as insert statements.
 *
 * Day offsets are relative to the seed anchor (0 = today, negative = past).
 */

export interface RequestBlueprint {
  chiefComplaint: string;
  symptoms: string;
  /** FDI tooth numbers the patient flagged. */
  teeth: number[];
  attachments: MediaBlueprint[];
  submittedDayOffset: number;
}

export interface ExaminationVisitBlueprint {
  dayOffset: number;
  start: string;
  durationMinutes: number;
  status: ExaminationAppointmentStatus;
}

export interface InitialExaminationBlueprint {
  clinicalFindings: string;
  diagnosis: string;
  status: InitialExaminationStatus;
}

export interface AppointmentBlueprint {
  dayOffset: number;
  start: string;
  durationMinutes: number;
  status: ClinicalAppointmentStatus;
}

export interface PlannedProcedureBlueprint {
  /** Must match a `SubjectProcedures.name` of the case's subject. */
  procedure: string;
  tooth: number;
  status: PlannedProceduresStatus;
}

export interface DiagnosisBlueprint {
  submittedDayOffset: number;
  images: MediaBlueprint[];
  procedures: PlannedProcedureBlueprint[];
  /** Present once the supervisor has approved the plan. */
  review?: { notes: string; dayOffset: number };
}

export interface SessionProcedureRef {
  procedure: string;
  tooth: number;
}

export interface SessionBlueprint {
  title: string;
  status: TreatmentSessionStatus;
  appointment: AppointmentBlueprint;
  studentNotes?: string;
  supervisorNotes?: string;
  /** Planned procedures worked on in this session. */
  procedures: SessionProcedureRef[];
  /** Material keys consumed. */
  materials: string[];
}

export interface EvaluationBlueprint {
  grade: Grade;
  comment: string;
  dayOffset: number;
}

export interface CaseBlueprint {
  /** Idempotency key for the whole scenario subtree. */
  key: string;
  /** Short label shown in the run report. */
  title: string;
  targetStage: ClinicalCaseStatus;
  patientKey: string;
  subjectKey: string;
  /** Required from ASSIGNED onward. */
  studentKey?: string;
  request: RequestBlueprint;
  examinationVisit: ExaminationVisitBlueprint;
  initialExamination: InitialExaminationBlueprint;
  /** The appointment that pulled the case out of the open pool. */
  assignment?: AppointmentBlueprint;
  diagnosis?: DiagnosisBlueprint;
  sessions?: SessionBlueprint[];
  caseMedia?: MediaBlueprint[];
  evaluation?: EvaluationBlueprint;
}

/** A request still sitting in the coordinator's queue — it never became a case. */
export interface PendingRequestBlueprint {
  key: string;
  title: string;
  patientKey: string;
  request: RequestBlueprint;
  /** Absent when the patient has not been given a slot yet. */
  examinationVisit?: ExaminationVisitBlueprint;
}
