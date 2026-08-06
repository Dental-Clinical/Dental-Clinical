import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateSectionSubjectDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  section_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  subject_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  supervisor_id?: number;
}
