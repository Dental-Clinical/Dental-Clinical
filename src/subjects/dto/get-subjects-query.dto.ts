import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetSubjectsBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by study year ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  study_year_id?: number;

  @ApiPropertyOptional({
    description: 'Search by subject name',
    example: 'Restorative',
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

export class GetSubjectsQueryDto extends IntersectionType(
  GetSubjectsBaseDto,
  PaginationDto,
) {}
