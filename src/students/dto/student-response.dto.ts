import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StudentUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  full_name: string;

  @ApiProperty({ example: 'Ahmad' })
  father_name: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '963912345678' })
  phone?: string;

  @ApiProperty({ example: true })
  is_active: boolean;
}

class StudentStudyYearDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'First Year' })
  name: string;

  @ApiProperty({ example: 1 })
  level: number;
}

export class StudentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024001' })
  university_id: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ type: StudentUserDto })
  user: StudentUserDto;

  @ApiPropertyOptional({
    type: StudentStudyYearDto,
    nullable: true,
    description: 'Study year of the current enrollment, if any',
  })
  studyYear: StudentStudyYearDto | null;
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

export class PaginatedStudentsResponseDto {
  @ApiProperty({ type: [StudentResponseDto] })
  data: StudentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
