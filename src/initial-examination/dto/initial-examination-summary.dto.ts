import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';

export class InitialExaminationSummaryDto {
  id: number;
  patient: string;
  coordinator: string;
  subject: string;
  status: string;
  appointmentDate: Date;
  clinicalCaseStatus: ClinicalCaseStatus;
}
