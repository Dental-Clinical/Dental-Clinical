import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('SY', {
    message: 'Phone number must be a valid Syrian phone number',
  })
  phone: string;
}
