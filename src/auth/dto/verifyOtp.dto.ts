import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('SY', {
    message: 'Phone number must be a valid Syrian phone number',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, {
    message: 'OTP must be exactly 6 digits',
  })
  otp: string;
}
