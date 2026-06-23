import { IsNotEmpty, IsString } from 'class-validator';

export class StaffLoginDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
