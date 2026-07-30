import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';

export class StudentAssignedCaseDetailsDto {
  caseInfo: CaseInfo;
  treatmentPlan: TreatmentPlan;
  materials: Materials;
  caseMedia: CaseMedia;
  timeline: Timeline[];
  supervisorNotes: SupervisorNotes[];
}

class CaseInfo {
  id: number;
  status: ClinicalCaseStatus;
  patientName: string;
  patientId: number;
  patientAge: number;
  subject: string;
  supervisor: string;
  nextSession: NextSessionDto;
}
export class NextSessionDto {
  id: number;

  appointmentDate: Date;

  startTime: string;
}
class TreatmentPlan {
  targetTeeth: {
    tooth: number;
    procedure: string;
    status: PlannedProceduresStatus;
  }[];
}

class Materials {
  materials: string[];
}

class CaseMedia {
  id: number;
  type: string;
  url: string;
  takenAt: Date;
}

class Timeline {
  sessionNumber: number;
  status: TreatmentSessionStatus;
  date: Date;
  title: string;
}

class SupervisorNotes {
  sessionId: number;
  supervisor: string;
  createdAt: Date;
  notes: string;
}
