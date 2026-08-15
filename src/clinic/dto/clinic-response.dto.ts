import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Section A' })
  name: string;
}
export class ClinicResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dental Clinic' })
  name: string;

  @ApiPropertyOptional({ example: 'Main teaching clinic' })
  description?: string;

  @ApiProperty({
    type: [SectionResponseDto],
  })
  sections: SectionResponseDto[];
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

export class GetClinicsResponseDto {
  @ApiProperty({ example: 'Clinics retrieved successfully' })
  message: string;

  @ApiProperty({ type: [ClinicResponseDto] })
  clinics: ClinicResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class ClinicItemResponseDto {
  @ApiProperty({ example: 'Clinic retrieved successfully' })
  message: string;

  @ApiProperty({ type: ClinicResponseDto })
  clinic: ClinicResponseDto;
}

export class CreateClinicResponseDto {
  @ApiProperty({ example: 'Clinic created successfully' })
  message: string;

  @ApiProperty({ type: ClinicResponseDto })
  data: ClinicResponseDto;
}

export class UpdateClinicResponseDto {
  @ApiProperty({ example: 'Clinic updated successfully' })
  message: string;

  @ApiProperty({ type: ClinicResponseDto })
  data: ClinicResponseDto;
}

export class DeleteClinicResponseDto {
  @ApiProperty({ example: 'Clinic deleted successfully' })
  message: string;
}
