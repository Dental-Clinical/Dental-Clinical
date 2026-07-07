import { IsNumber, IsString } from 'class-validator';

export class CreateInitialExaminationDto {
  @IsNumber()
  request_id: number;

  @IsNumber()
  appointment_id: number;

  @IsNumber()
  coordinator_id: number;

  @IsNumber()
  subject_id: number;

  @IsString()
  diagnosis: string;

  @IsString()
  clinicalFindings: string;
}
