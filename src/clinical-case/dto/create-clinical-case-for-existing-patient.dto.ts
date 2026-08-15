import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateClinicalCaseForExistingPatientDto {
  @ApiProperty({ description: 'Patient ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  patientId: number;

  @ApiProperty({ description: 'Subject ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  subjectId: number;

  @ApiProperty({
    description: 'Symptoms',
    example: 'Toothache and sensitivity',
  })
  @IsNotEmpty()
  @IsString()
  symptoms: string;

  @ApiProperty({
    description: 'Chief Complaint',
    example: 'Severe pain in the upper left molar',
  })
  @IsNotEmpty()
  @IsString()
  chiefComplaint: string;

  @ApiProperty({ example: 'Deep caries on tooth 36' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({ example: 'Sensitivity to percussion, no swelling' })
  @IsString()
  @IsNotEmpty()
  clinicalFindings: string;
}
