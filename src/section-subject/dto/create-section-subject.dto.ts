import { IsInt, IsPositive } from 'class-validator';

export class CreateSectionSubjectDto {
  @IsInt()
  @IsPositive()
  section_id: number;

  @IsInt()
  @IsPositive()
  subject_id: number;

  @IsInt()
  @IsPositive()
  supervisor_id: number;

  @IsInt()
  @IsPositive()
  academic_year_id: number;
}
