import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePatientMedicalRecordsDto {
  @ApiPropertyOptional({ example: 'Hypertension, diagnosed 2020' })
  @IsOptional()
  @IsString()
  medical_history: string;

  @ApiPropertyOptional({ example: 'Penicillin' })
  @IsOptional()
  @IsString()
  allergies: string;

  @ApiPropertyOptional({ example: 'Lisinopril 10mg daily' })
  @IsOptional()
  @IsString()
  current_medications: string;
}
