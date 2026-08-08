import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetSupervisorStudentsBaseDto {
  @ApiPropertyOptional({
    description: 'Search by name, father name, university ID, email, or phone',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Only keep this subject. Ignored unless the supervisor teaches it.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  subject_id?: number;
}

export class GetSupervisorStudentsQueryDto extends IntersectionType(
  GetSupervisorStudentsBaseDto,
  PaginationDto,
) {}
