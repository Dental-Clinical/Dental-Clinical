import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateClinicalCaseEvaluationDto {
  @ApiPropertyOptional({
    description: 'Supervisor comments on the case',
    example: 'Very good diagnosis and treatment execution.',
  })
  @IsOptional()
  @IsString()
  comment?: string

  @ApiPropertyOptional({ description: 'Overall grade out of 100', example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  grade?: number
}
