import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetAcademicYearsBaseDto {
  @ApiPropertyOptional({
    description: 'Search by label',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;
}

export class GetAcademicYearsQueryDto extends IntersectionType(
  GetAcademicYearsBaseDto,
  PaginationDto,
) {}
