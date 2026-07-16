import { ApiProperty } from '@nestjs/swagger';

export class StudentSectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  student_academic_year_id: number;

  @ApiProperty({ example: 1 })
  clinic_section_id: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
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

export class GetStudentSectionsResponseDto {
  @ApiProperty({ example: 'Student sections retrieved successfully' })
  message: string;

  @ApiProperty({ type: [StudentSectionResponseDto] })
  data: StudentSectionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class StudentSectionItemResponseDto {
  @ApiProperty({ example: 'Student section retrieved successfully' })
  message: string;

  @ApiProperty({ type: StudentSectionResponseDto })
  data: StudentSectionResponseDto;
}

export class CreateStudentSectionResponseDto {
  @ApiProperty({ example: 'Student section created successfully' })
  message: string;

  @ApiProperty({ type: StudentSectionResponseDto })
  data: StudentSectionResponseDto;
}

export class UpdateStudentSectionResponseDto {
  @ApiProperty({ example: 'Student section updated successfully' })
  message: string;

  @ApiProperty({ type: StudentSectionResponseDto })
  data: StudentSectionResponseDto;
}

export class DeleteStudentSectionResponseDto {
  @ApiProperty({ example: 'Student section deleted successfully' })
  message: string;
}
