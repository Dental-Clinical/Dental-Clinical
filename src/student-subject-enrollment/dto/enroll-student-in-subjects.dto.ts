import { IsArray, IsInt, IsPositive } from 'class-validator';

class SubjectEnrollmentDto {
  @IsInt()
  @IsPositive()
  subject_id: number;

  @IsInt()
  @IsPositive()
  section_id: number;
}
export class EnrollStudentInSubjectsDto {
  @IsInt()
  @IsPositive()
  student_id: number;

  @IsArray({ each: true })
  enrollments: SubjectEnrollmentDto[];

  @IsInt()
  @IsPositive()
  academic_year_id: number;
}
