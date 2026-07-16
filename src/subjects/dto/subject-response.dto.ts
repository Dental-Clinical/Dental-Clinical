import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  study_year_id: number;

  @ApiProperty({ example: 'Restorative Dentistry' })
  name: string;

  @ApiPropertyOptional({ example: 'Covers restorative procedures' })
  description: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at: Date;
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

export class GetSubjectsResponseDto {
  @ApiProperty({ example: 'Subjects retrieved successfully' })
  message: string;

  @ApiProperty({ type: [SubjectResponseDto] })
  data: SubjectResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class SubjectItemResponseDto {
  @ApiProperty({ example: 'Subject retrieved successfully' })
  message: string;

  @ApiProperty({ type: SubjectResponseDto })
  data: SubjectResponseDto;
}

export class CreateSubjectResponseDto {
  @ApiProperty({ example: 'Subject created successfully' })
  message: string;

  @ApiProperty({ type: SubjectResponseDto })
  data: SubjectResponseDto;
}

export class UpdateSubjectResponseDto {
  @ApiProperty({ example: 'Subject updated successfully' })
  message: string;

  @ApiProperty({ type: SubjectResponseDto })
  data: SubjectResponseDto;
}

export class DeleteSubjectResponseDto {
  @ApiProperty({ example: 'Subject deleted successfully' })
  message: string;
}
