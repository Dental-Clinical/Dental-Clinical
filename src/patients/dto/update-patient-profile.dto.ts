import { IsOptional } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsOptional()
  medical_history?: string;

  @IsOptional()
  current_medications?: string;

  @IsOptional()
  allergies?: string;
}
