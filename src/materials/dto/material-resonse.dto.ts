import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaterialResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Composite Resin' })
  name: string;

  @ApiPropertyOptional({ example: 'Tooth-colored restorative material' })
  description?: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
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

export class GetMaterialsResponseDto {
  @ApiProperty({ example: 'Materials retrieved successfully' })
  message: string;

  @ApiProperty({ type: [MaterialResponseDto] })
  data: MaterialResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class GetMaterialByIdResponseDto {
  @ApiProperty({ example: 'Material retrieved successfully' })
  message: string;

  @ApiProperty({ type: MaterialResponseDto })
  data: MaterialResponseDto;
}

export class CreateMaterialResponseDto {
  @ApiProperty({ example: 'Material created successfully' })
  message: string;

  @ApiProperty({ type: MaterialResponseDto })
  data: MaterialResponseDto;
}

export class UpdateMaterialResponseDto {
  @ApiProperty({ example: 'Material updated successfully' })
  message: string;

  @ApiProperty({ type: MaterialResponseDto })
  data: MaterialResponseDto;
}

export class DeleteMaterialResponseDto {
  @ApiProperty({ example: 'Material deleted successfully' })
  message: string;
}
