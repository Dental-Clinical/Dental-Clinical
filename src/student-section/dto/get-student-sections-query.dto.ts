import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetStudentSectionsBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by student academic year ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  student_academic_year_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by clinic section ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clinic_section_id?: number;
}

export class GetStudentSectionsQueryDto extends IntersectionType(
  GetStudentSectionsBaseDto,
  PaginationDto,
) {}
