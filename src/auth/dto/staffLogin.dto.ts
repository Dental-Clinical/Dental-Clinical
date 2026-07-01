import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StaffLoginDto {
  @ApiProperty({
    description: 'Email or university ID',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
