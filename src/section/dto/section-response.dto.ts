import { ApiProperty } from '@nestjs/swagger';

class ClinicDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dental Clinic' })
  name: string;
}
export class SectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Section A' })
  name: string;

  @ApiProperty({ type: ClinicDto })
  clinic: ClinicDto;
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

export class GetSectionsResponseDto {
  @ApiProperty({ example: 'Sections retrieved successfully' })
  message: string;

  @ApiProperty({ type: [SectionResponseDto] })
  data: SectionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class SectionItemResponseDto {
  @ApiProperty({ example: 'Section retrieved successfully' })
  message: string;

  @ApiProperty({ type: SectionResponseDto })
  data: SectionResponseDto;
}

export class CreateSectionResponseDto {
  @ApiProperty({ example: 'Section created successfully' })
  message: string;

  @ApiProperty({ type: SectionResponseDto })
  data: SectionResponseDto;
}

export class UpdateSectionResponseDto {
  @ApiProperty({ example: 'Section updated successfully' })
  message: string;

  @ApiProperty({ type: SectionResponseDto })
  data: SectionResponseDto;
}

export class DeleteSectionResponseDto {
  @ApiProperty({ example: 'Section deleted successfully' })
  message: string;
}
