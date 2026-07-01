import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  full_name: string;

  @ApiProperty({ example: 'Doe' })
  father_name: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '963912345678' })
  phone?: string;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
