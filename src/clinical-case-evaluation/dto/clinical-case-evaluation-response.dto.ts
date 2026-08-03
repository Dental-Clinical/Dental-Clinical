import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { Grade } from '../enums/grade.enum';

export class ClinicalCaseEvaluationDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  clinicalCaseId: number;

  @ApiProperty({ example: 1 })
  studentId: number;

  @ApiProperty({ example: 1 })
  supervisorId: number;

  @ApiProperty({ enum: Grade, example: Grade.A })
  grade: Grade;

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

export class StudentClinicalCaseEvaluationItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  clinicalCaseId: number;

  @ApiProperty({
    enum: ClinicalCaseStatus,
    example: ClinicalCaseStatus.COMPLETED,
  })
  clinicalCaseStatus: ClinicalCaseStatus;

  @ApiProperty({ example: 1 })
  subjectId: number;

  @ApiProperty({ example: 'Operative Dentistry' })
  subjectName: string;

  @ApiProperty({ example: 1 })
  supervisorId: number;

  @ApiProperty({ example: 'Dr. Sarah Malek' })
  supervisorName: string;

  @ApiProperty({ enum: Grade, example: Grade.A })
  grade: Grade;

  @ApiPropertyOptional({
    example: 'Very good diagnosis and treatment execution.',
  })
  comment?: string;

  @ApiProperty({ example: '2026-07-31T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-31T00:00:00.000Z' })
  updatedAt: Date;
}

export class ClinicalCaseEvaluationsSummaryDto {
  @ApiProperty({
    description: 'Number of evaluations matching the filters',
    example: 4,
  })
  count: number;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 4 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class GetClinicalCaseEvaluationsResponseDto {
  @ApiProperty({ example: 'Clinical case evaluations retrieved successfully.' })
  message: string;

  @ApiProperty({ type: [StudentClinicalCaseEvaluationItemDto] })
  data: StudentClinicalCaseEvaluationItemDto[];

  @ApiProperty({ type: ClinicalCaseEvaluationsSummaryDto })
  summary: ClinicalCaseEvaluationsSummaryDto;

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
