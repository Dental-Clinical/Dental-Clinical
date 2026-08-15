import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

class SubjectEnrollmentDto {
  @ApiProperty({
    description: 'ID of the subject to enroll the student in',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  subject_id: number;

  @ApiProperty({
    description: 'ID of the section to enroll the student in',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  section_id: number;
}
export class EnrollStudentInSubjectsDto {
  @ApiProperty({
    description: 'ID of the student to enroll in subjects',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  student_id: number;

  @ApiProperty({
    description: 'List of subjects and sections to enroll the student in',
    type: [SubjectEnrollmentDto],
  })
  @IsArray()
  @IsNotEmpty()
  @IsArray({ each: true })
  enrollments: SubjectEnrollmentDto[];

  @ApiProperty({
    description: 'ID of the academic year for the enrollment',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  academic_year_id: number;
}
