import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSupervisorDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  father_name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}
