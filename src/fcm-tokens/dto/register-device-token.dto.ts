import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DevicePlatform } from '../enums/device-platform.enum';

export class RegisterDeviceTokenDto {
  @ApiProperty({
    description: 'FCM registration token issued to the device',
    example: 'fGx9kQ2rT0uW...:APA91bH8...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(4096)
  token: string;

  @ApiProperty({
    description: 'Platform the token was issued on',
    enum: DevicePlatform,
    example: DevicePlatform.ANDROID,
  })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;
}
