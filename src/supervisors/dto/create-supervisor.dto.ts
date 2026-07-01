import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupervisorDto {
  @ApiProperty({
    description: 'Full name of the supervisor',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Father name of the supervisor',
    example: 'Michael Doe',
  })
  @IsNotEmpty()
  @IsString()
  father_name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'supervisor@clinic.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '963944635988',
  })
  @IsNotEmpty()
  @IsPhoneNumber('SY')
  @IsString()
  phone: string;
}
