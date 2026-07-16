import { IsOptional, IsString, IsInt, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class FilterClinicalCasesDto {
  @ApiPropertyOptional({
    enum: ClinicalCaseStatus,
    example: ClinicalCaseStatus.OPEN,
    description: 'Filter by clinical case status',
  })
  @IsOptional()
  @IsEnum(ClinicalCaseStatus)
  status?: ClinicalCaseStatus;

  @ApiPropertyOptional({ example: 1, description: 'Filter by subject ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by assigned student ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedStudentId?: number;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Filter by the current study year of the assigned student. Excludes unassigned cases.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  studyYearId?: number;

  @ApiPropertyOptional({
    example: 'Ahmad',
    description: 'Partial, case-insensitive match on patient full name',
  })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Only cases created on or after this date',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Only cases created on or before this date',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
