import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetMaterialsBaseDto {
  @ApiPropertyOptional({
    description: 'Search by material name',
    example: 'composite',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetMaterialsQueryDto extends IntersectionType(
  GetMaterialsBaseDto,
  PaginationDto,
) {}
