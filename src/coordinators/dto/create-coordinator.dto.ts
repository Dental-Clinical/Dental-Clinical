import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCoordinatorDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}
