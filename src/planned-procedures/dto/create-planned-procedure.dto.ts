import { IsInt, Min } from 'class-validator';

export class CreatePlannedProcedureDto {
  @IsInt()
  @Min(1)
  subjectProcedureId: number;

  @IsInt()
  toothNumber: number;
}
