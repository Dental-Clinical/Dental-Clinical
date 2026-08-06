import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ChangeStudentSectionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  section_id?: number;
}
