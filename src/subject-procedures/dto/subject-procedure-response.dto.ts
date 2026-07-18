import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectProcedureResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  subject_id: number;

  @ApiProperty({ example: 'Composite Filling' })
  name: string;

  @ApiPropertyOptional({ example: 'Direct composite restoration' })
  description: string;

  @ApiProperty({ example: 3 })
  required_count: number;

  @ApiProperty({ example: true })
  is_active: boolean;

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

export class GetSubjectProceduresResponseDto {
  @ApiProperty({ example: 'Subject procedures retrieved successfully' })
  message: string;

  @ApiProperty({ type: [SubjectProcedureResponseDto] })
  data: SubjectProcedureResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class SubjectProcedureItemResponseDto {
  @ApiProperty({ example: 'Subject procedure retrieved successfully' })
  message: string;

  @ApiProperty({ type: SubjectProcedureResponseDto })
  data: SubjectProcedureResponseDto;
}

export class CreateSubjectProcedureResponseDto {
  @ApiProperty({ example: 'Subject procedure created successfully' })
  message: string;

  @ApiProperty({ type: SubjectProcedureResponseDto })
  data: SubjectProcedureResponseDto;
}

export class UpdateSubjectProcedureResponseDto {
  @ApiProperty({ example: 'Subject procedure updated successfully' })
  message: string;

  @ApiProperty({ type: SubjectProcedureResponseDto })
  data: SubjectProcedureResponseDto;
}

export class DeleteSubjectProcedureResponseDto {
  @ApiProperty({ example: 'Subject procedure deleted successfully' })
  message: string;
}
