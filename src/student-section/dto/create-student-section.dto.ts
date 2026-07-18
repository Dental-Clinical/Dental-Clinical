import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentSectionDto {
  @ApiProperty({
    description: 'Associated student academic year ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  student_academic_year_id: number;

  @ApiProperty({ description: 'Associated clinic section ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  clinic_section_id: number;
}
