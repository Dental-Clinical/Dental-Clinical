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

class GetSubjectProceduresBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by subject ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  subject_id?: number;

  @ApiPropertyOptional({
    description: 'Search by procedure name',
    example: 'Composite',
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

export class GetSubjectProceduresQueryDto extends IntersectionType(
  GetSubjectProceduresBaseDto,
  PaginationDto,
) {}
