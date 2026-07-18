import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetStudentAcademicYearsBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  student_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by academic year ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  academic_year_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by study year ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  study_year_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by current enrollment status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCurrent?: boolean;
}

export class GetStudentAcademicYearsQueryDto extends IntersectionType(
  GetStudentAcademicYearsBaseDto,
  PaginationDto,
) {}
