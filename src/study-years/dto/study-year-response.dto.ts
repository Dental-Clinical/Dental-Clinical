import { ApiProperty } from '@nestjs/swagger';

export class StudyYearResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'First Year' })
  name: string;

  @ApiProperty({ example: 1 })
  level: number;
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

export class GetStudyYearsResponseDto {
  @ApiProperty({ example: 'Study years retrieved successfully' })
  message: string;

  @ApiProperty({ type: [StudyYearResponseDto] })
  data: StudyYearResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class StudyYearItemResponseDto {
  @ApiProperty({ example: 'Study year retrieved successfully' })
  message: string;

  @ApiProperty({ type: StudyYearResponseDto })
  data: StudyYearResponseDto;
}

export class CreateStudyYearResponseDto {
  @ApiProperty({ example: 'Study year created successfully' })
  message: string;

  @ApiProperty({ type: StudyYearResponseDto })
  data: StudyYearResponseDto;
}

export class UpdateStudyYearResponseDto {
  @ApiProperty({ example: 'Study year updated successfully' })
  message: string;

  @ApiProperty({ type: StudyYearResponseDto })
  data: StudyYearResponseDto;
}

export class DeleteStudyYearResponseDto {
  @ApiProperty({ example: 'Study year deleted successfully' })
  message: string;
}
