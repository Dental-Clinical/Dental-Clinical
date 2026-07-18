import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentAcademicYearDto {
  @ApiProperty({ description: 'Associated student ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  student_id: number;

  @ApiProperty({ description: 'Associated academic year ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  academic_year_id: number;

  @ApiProperty({ description: 'Associated study year ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  study_year_id: number;

  @ApiPropertyOptional({
    description: 'Whether this is the current enrollment',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
