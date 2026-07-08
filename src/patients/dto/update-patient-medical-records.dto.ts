import { IsOptional, IsString } from 'class-validator';

export class UpdatePatientMedicalRecordsDto {
  @IsOptional()
  @IsString()
  medical_history: string;

  @IsOptional()
  @IsString()
  allergies: string;

  @IsOptional()
  @IsString()
  current_medications: string;
}
