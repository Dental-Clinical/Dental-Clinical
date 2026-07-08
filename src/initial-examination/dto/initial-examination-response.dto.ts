import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { InitialExaminationStatus } from '../enums/initial-examination-status.enum';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';

export class InitialExaminationResponseDto {
  id: number;
  diagnosis: string;
  clinicalFindings: string;
  status: InitialExaminationStatus;
  examinedAt: Date;

  request: {
    id: number;
    status: ExaminationRequestStatus;
  };

  clinicalCase: {
    id: number;
    status: ClinicalCaseStatus;
  };
}
