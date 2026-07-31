import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetClinicalCaseEvaluationsBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by the subject of the clinical case',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  subjectId?: number;

  @ApiPropertyOptional({
    description: 'Only include evaluations with a grade greater than or equal to this value',
    example: 60,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minGrade?: number;

  @ApiPropertyOptional({
    description: 'Only include evaluations with a grade less than or equal to this value',
    example: 100,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  maxGrade?: number;

  @ApiPropertyOptional({
    description: 'Only include evaluations created on or after this date',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Only include evaluations created on or before this date',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class GetClinicalCaseEvaluationsQueryDto extends IntersectionType(
  GetClinicalCaseEvaluationsBaseDto,
  PaginationDto,
) {}
