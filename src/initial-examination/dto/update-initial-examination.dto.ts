import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateInitialExaminationDto {

  @ApiPropertyOptional({ example: 1, description: 'Subject ID' })
  @IsOptional()
  @IsNumber()
  subject_id: number

  @ApiPropertyOptional({ example: 1, description: 'Clinical case ID' })
  @IsOptional()
  @IsNumber()
  clinical_case_id: number

  @ApiPropertyOptional({ example: 'Deep caries on tooth 36' })
  @IsOptional()
  @IsString()
  diagnosis: string

  @ApiPropertyOptional({ example: 'Sensitivity to percussion, no swelling' })
  @IsOptional()
  @IsString()
  clinical_findings: string

}
