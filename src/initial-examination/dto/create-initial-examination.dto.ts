import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInitialExaminationDto {
  @ApiProperty({ example: 1, description: 'Examination request ID' })
  @IsNumber()
  @IsPositive()
  request_id: number;

  @ApiProperty({ example: 1, description: 'Examination appointment ID' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  appointment_id?: number;

  @ApiProperty({ example: 1, description: 'Patient ID' })
  @IsNumber()
  @IsPositive()
  patient_id: number;

  @ApiProperty({ example: 1, description: 'Subject ID' })
  @IsNumber()
  subject_id: number;

  @ApiProperty({ example: 'Deep caries on tooth 36' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'Sensitivity to percussion, no swelling' })
  @IsString()
  clinicalFindings: string;
}
