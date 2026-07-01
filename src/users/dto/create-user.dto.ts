import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/constants/user-roles';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;
  @IsNotEmpty()
  @IsString()
  father_name: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  @IsString()
  role: UserRole;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('SY')
  phone?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  profile_image?: string;
}
