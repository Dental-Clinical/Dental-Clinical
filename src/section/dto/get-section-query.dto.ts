import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetSectionsBaseDto {
  @ApiPropertyOptional({
    description: 'Search by section name',
    example: 'section a',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by clinic ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clinic_id?: number;
}

export class GetSectionsQueryDto extends IntersectionType(
  GetSectionsBaseDto,
  PaginationDto,
) {}
