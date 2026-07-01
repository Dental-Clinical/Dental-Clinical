import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Syrian phone number',
    example: '963912345678',
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('SY', {
    message: 'Phone number must be a valid Syrian phone number',
  })
  phone: string;

  @ApiProperty({
    description: 'One-time password sent via WhatsApp',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, {
    message: 'OTP must be exactly 6 digits',
  })
  otp: string;
}
