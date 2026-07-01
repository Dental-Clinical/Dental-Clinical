import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Syrian phone number',
    example: '963912345678',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('SY', {
    message: 'Phone number must be a valid Syrian phone number',
  })
  phone: string;
}
