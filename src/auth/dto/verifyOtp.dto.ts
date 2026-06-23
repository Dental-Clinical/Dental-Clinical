import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('SY', {
    message: 'Phone number must be a valid Syrian phone number',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, {
    message: 'OTP must be exactly 6 digits',
  })
  otp: string;
}
