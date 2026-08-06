import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetClinicsBaseDto {
  @ApiPropertyOptional({
    description: 'Search by clinic name',
    example: 'dental',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetClinicsQueryDto extends IntersectionType(
  GetClinicsBaseDto,
  PaginationDto,
) {}
