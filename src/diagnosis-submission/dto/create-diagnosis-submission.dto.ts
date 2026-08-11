import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePlannedProcedureWithAnswersDto } from './create-planned-procedure-with-answers.dto';

export class CreateDiagnosisSubmissionDto {
  @IsInt()
  @Min(1)
  clinicalCaseId: number;

  @ValidateNested({ each: true })
  @Type(() => CreatePlannedProcedureWithAnswersDto)
  @ArrayMinSize(1)
  plannedProcedures: CreatePlannedProcedureWithAnswersDto[];

  @IsOptional()
  @Transform(() => undefined)
  images?: unknown;
}
