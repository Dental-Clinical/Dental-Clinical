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

class GetStudentsBaseDto {
  @ApiPropertyOptional({
    description: 'Search by name, father name, university ID, email, or phone',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by the study year of the current enrollment',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  study_year_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by the academic year of the current enrollment',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  academic_year_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by active status of the student account',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;
}

export class GetStudentsQueryDto extends IntersectionType(
  GetStudentsBaseDto,
  PaginationDto,
) {}
