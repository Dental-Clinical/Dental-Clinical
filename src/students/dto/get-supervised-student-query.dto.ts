import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class GetSupervisedStudentQueryDto {
  @ApiPropertyOptional({
    description:
      'Narrow the response to one subject. 404 unless the supervisor teaches the student this subject.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  subject_id?: number;
}
