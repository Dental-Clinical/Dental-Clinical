import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Registration token obtained from verify-otp',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  registrationToken: string;

  @ApiProperty({
    description: 'Full name of the patient',
    example: 'John',
    minLength: 2,
    maxLength: 55,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(55)
  full_name: string;

  @ApiProperty({
    description: 'Father name of the patient',
    example: 'Doe',
    minLength: 2,
    maxLength: 55,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(55)
  father_name: string;

  @ApiProperty({
    description: 'Age of the patient',
    example: 25,
  })
  @IsNotEmpty()
  @IsInt()
  age: number;

  @ApiProperty({
    description: 'Gender of the patient',
    enum: ['male', 'female'],
    example: 'male',
  })
  @IsNotEmpty()
  @IsString()
  gender: 'male' | 'female';
}
