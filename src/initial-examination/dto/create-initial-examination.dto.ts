import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInitialExaminationDto {
  @ApiProperty({ example: 1, description: 'Examination request ID' })
  @IsNumber()
  request_id: number;

  @ApiProperty({ example: 1, description: 'Examination appointment ID' })
  @IsNumber()
  appointment_id: number;

  @ApiProperty({ example: 1, description: 'Coordinator ID' })
  @IsNumber()
  coordinator_id: number;

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
