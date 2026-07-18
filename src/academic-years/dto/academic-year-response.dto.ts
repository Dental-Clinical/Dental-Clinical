import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024-2025' })
  label: string;

  @ApiProperty({ example: '2024-09-01' })
  start_date: Date;

  @ApiProperty({ example: '2025-06-30' })
  end_date: Date;

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

export class GetAcademicYearsResponseDto {
  @ApiProperty({ example: 'Academic years retrieved successfully' })
  message: string;

  @ApiProperty({ type: [AcademicYearResponseDto] })
  data: AcademicYearResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class AcademicYearItemResponseDto {
  @ApiProperty({ example: 'Academic year retrieved successfully' })
  message: string;

  @ApiProperty({ type: AcademicYearResponseDto })
  data: AcademicYearResponseDto;
}

export class CreateAcademicYearResponseDto {
  @ApiProperty({ example: 'Academic year created successfully' })
  message: string;

  @ApiProperty({ type: AcademicYearResponseDto })
  data: AcademicYearResponseDto;
}

export class UpdateAcademicYearResponseDto {
  @ApiProperty({ example: 'Academic year updated successfully' })
  message: string;

  @ApiProperty({ type: AcademicYearResponseDto })
  data: AcademicYearResponseDto;
}

export class DeleteAcademicYearResponseDto {
  @ApiProperty({ example: 'Academic year deleted successfully' })
  message: string;
}
