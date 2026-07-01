import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Full name of the student',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Father name of the student',
    example: 'Michael Doe',
  })
  @IsNotEmpty()
  @IsString()
  father_name: string;

  @ApiProperty({
    description: 'University ID of the student',
    example: 'S12345678',
  })
  @IsNotEmpty()
  @IsString()
  university_id: string;
}
