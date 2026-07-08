import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class ClinicalCaseSummaryDto {
  id: number;
  status: ClinicalCaseStatus;
  createdAt: Date;

  patient: {
    id: number;
    fullName: string;
    phone: string;
  };

  subject: {
    id: number;
    name: string;
  };

  assignedStudent: {
    id: number;
    name: string;
  } | null;
}
