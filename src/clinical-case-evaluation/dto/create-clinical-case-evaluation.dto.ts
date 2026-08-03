import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Grade } from '../enums/grade.enum';

export class CreateClinicalCaseEvaluationDto {
  @ApiProperty({
    enum: Grade,
    description: 'Overall letter grade',
    example: Grade.A,
  })
  @IsEnum(Grade)
  grade: Grade;

  @ApiPropertyOptional({
    description: 'Supervisor comments on the case',
    example: 'Very good diagnosis and treatment execution.',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
