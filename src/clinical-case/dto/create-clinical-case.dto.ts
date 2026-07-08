import { IsInt } from 'class-validator';

export class CreateClinicalCaseDto {
  @IsInt()
  initialExaminationId: number;
}
