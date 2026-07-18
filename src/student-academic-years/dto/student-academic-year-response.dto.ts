import { ApiProperty } from '@nestjs/swagger';

export class StudentAcademicYearResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  student_id: number;

  @ApiProperty({ example: 1 })
  academic_year_id: number;

  @ApiProperty({ example: 1 })
  study_year_id: number;

  @ApiProperty({ example: true })
  isCurrent: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  enrolledAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class GetStudentAcademicYearsResponseDto {
  @ApiProperty({ example: 'Student academic years retrieved successfully' })
  message: string;

  @ApiProperty({ type: [StudentAcademicYearResponseDto] })
  data: StudentAcademicYearResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class StudentAcademicYearItemResponseDto {
  @ApiProperty({ example: 'Student academic year retrieved successfully' })
  message: string;

  @ApiProperty({ type: StudentAcademicYearResponseDto })
  data: StudentAcademicYearResponseDto;
}

export class CreateStudentAcademicYearResponseDto {
  @ApiProperty({ example: 'Student academic year created successfully' })
  message: string;

  @ApiProperty({ type: StudentAcademicYearResponseDto })
  data: StudentAcademicYearResponseDto;
}

export class UpdateStudentAcademicYearResponseDto {
  @ApiProperty({ example: 'Student academic year updated successfully' })
  message: string;

  @ApiProperty({ type: StudentAcademicYearResponseDto })
  data: StudentAcademicYearResponseDto;
}

export class DeleteStudentAcademicYearResponseDto {
  @ApiProperty({ example: 'Student academic year deleted successfully' })
  message: string;
}
