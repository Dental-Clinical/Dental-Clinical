import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClinicalCaseEvaluationDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  clinicalCaseId: number;

  @ApiProperty({ example: 1 })
  studentId: number;

  @ApiProperty({ example: 1 })
  supervisorId: number;

  @ApiProperty({ example: 85 })
  grade: number;

  @ApiPropertyOptional({
    example: 'Very good diagnosis and treatment execution.',
  })
  comment?: string;

  @ApiProperty({ example: '2026-07-31T00:00:00.000Z' })
  createdAt: Date;
}

export class CreateClinicalCaseEvaluationResponseDto {
  @ApiProperty({ example: 'Clinical case evaluated successfully' })
  message: string;

  @ApiProperty({ type: ClinicalCaseEvaluationDataDto })
  data: ClinicalCaseEvaluationDataDto;
}
