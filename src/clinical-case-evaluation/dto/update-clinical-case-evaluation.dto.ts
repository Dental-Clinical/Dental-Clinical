import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Grade } from '../enums/grade.enum';

export class UpdateClinicalCaseEvaluationDto {
  @ApiPropertyOptional({
    description: 'Supervisor comments on the case',
    example: 'Very good diagnosis and treatment execution.',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    enum: Grade,
    description: 'Overall letter grade',
    example: Grade.B_PLUS,
  })
  @IsOptional()
  @IsEnum(Grade)
  grade?: Grade;
}
