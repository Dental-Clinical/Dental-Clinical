import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateClinicalCaseEvaluationDto {
  @ApiProperty({ description: 'Overall grade out of 100', example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  grade: number

  @ApiPropertyOptional({
    description: 'Supervisor comments on the case',
    example: 'Very good diagnosis and treatment execution.',
  })
  @IsString()
  @IsOptional()
  comment?: string
}
