import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePlannedProcedureDto } from 'src/planned-procedures/dto/create-planned-procedure.dto';

export class CreateDiagnosisSubmissionDto {
  @IsInt()
  @Min(1)
  clinicalCaseId: number;

  @IsString()
  @IsNotEmpty()
  clinicalImpression: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePlannedProcedureDto)
  @ArrayMinSize(1)
  plannedProcedures: CreatePlannedProcedureDto[];
}
