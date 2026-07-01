import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCoordinatorDto {
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
