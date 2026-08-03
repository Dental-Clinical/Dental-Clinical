import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';
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
