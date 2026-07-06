import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateInitialExaminationDto {

  @IsOptional()
  @IsNumber()
  subject_id: number

  @IsOptional()
  @IsNumber()
  clinical_case_id: number

  @IsOptional()
  @IsString()
  diagnosis: string

  @IsOptional()
  @IsString()
  clinical_findings: string

}
