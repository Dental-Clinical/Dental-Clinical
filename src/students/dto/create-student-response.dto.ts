import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentResponseDto {
  @ApiProperty({
    description: 'ID of the created student',
    example: 1,
  })
  studentId: number;
}
