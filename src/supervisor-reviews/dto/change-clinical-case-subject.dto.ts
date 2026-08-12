import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class ChangeClinicalCaseSubjectDto {
  @ApiProperty({
    description: 'ID of the subject to reassign the clinical case to',
    example: 3,
  })
  @IsInt()
  @IsPositive()
  subjectId: number;
}
