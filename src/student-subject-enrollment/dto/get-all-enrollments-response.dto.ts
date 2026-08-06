import { ApiProperty } from '@nestjs/swagger';

class StudentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;
}

class SubjectDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Subject Name' })
  name: string;
}

class SectionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Section A' })
  name: string;
}
class EnrollmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: StudentDto })
  student: StudentDto;

  @ApiProperty({ example: '2023/2024' })
  academicYear: string;

  @ApiProperty({ example: '1st Year' })
  studyYear: string;

  @ApiProperty({ type: SubjectDto })
  subject: SubjectDto;

  @ApiProperty({ type: SectionDto })
  section: SectionDto;

  @ApiProperty({ example: 'Dr. Smith' })
  supervisor: string;
}
export class GetAllEnrollmentsResponseDto {
  @ApiProperty({
    example: 'Student subject enrollments retrieved successfully',
  })
  message: string;

  @ApiProperty({ type: [EnrollmentDto] })
  enrollments: EnrollmentDto[];
}

export class GetEnrollmentByIdResponseDto {
  @ApiProperty({
    example: 'Student subject enrollment retrieved successfully',
  })
  message: string;

  @ApiProperty({ type: EnrollmentDto })
  enrollment: EnrollmentDto;
}
