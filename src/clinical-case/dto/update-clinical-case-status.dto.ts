import { IsEnum } from 'class-validator';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class UpdateClinicalCaseStatusDto {
  @IsEnum(ClinicalCaseStatus)
  status: ClinicalCaseStatus;
}
