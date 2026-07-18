import { ApiProperty } from '@nestjs/swagger';

export class ClinicSectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  subject_id: number;

  @ApiProperty({ example: 1 })
  supervisor_id: number;

  @ApiProperty({ example: 'Section A' })
  name: string;

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

export class GetClinicSectionsResponseDto {
  @ApiProperty({ example: 'Clinic sections retrieved successfully' })
  message: string;

  @ApiProperty({ type: [ClinicSectionResponseDto] })
  data: ClinicSectionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class ClinicSectionItemResponseDto {
  @ApiProperty({ example: 'Clinic section retrieved successfully' })
  message: string;

  @ApiProperty({ type: ClinicSectionResponseDto })
  data: ClinicSectionResponseDto;
}

export class CreateClinicSectionResponseDto {
  @ApiProperty({ example: 'Clinic section created successfully' })
  message: string;

  @ApiProperty({ type: ClinicSectionResponseDto })
  data: ClinicSectionResponseDto;
}

export class UpdateClinicSectionResponseDto {
  @ApiProperty({ example: 'Clinic section updated successfully' })
  message: string;

  @ApiProperty({ type: ClinicSectionResponseDto })
  data: ClinicSectionResponseDto;
}

export class DeleteClinicSectionResponseDto {
  @ApiProperty({ example: 'Clinic section deleted successfully' })
  message: string;
}
