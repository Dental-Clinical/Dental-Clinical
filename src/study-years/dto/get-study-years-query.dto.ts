import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetStudyYearsBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by level',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  level?: number;

  @ApiPropertyOptional({
    description: 'Search by study year name',
    example: 'First',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetStudyYearsQueryDto extends IntersectionType(
  GetStudyYearsBaseDto,
  PaginationDto,
) {}
