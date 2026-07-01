import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoordinatorDto {
  @ApiProperty({
    description: 'Full name of the coordinator',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Father name of the coordinator',
    example: 'Michael Doe',
  })
  @IsNotEmpty()
  @IsString()
  father_name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'coordinator@clinic.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '963933673475',
  })
  @IsNotEmpty()
  @IsPhoneNumber('SY')
  @IsString()
  phone: string;
}
