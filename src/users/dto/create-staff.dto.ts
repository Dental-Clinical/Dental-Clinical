import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/constants/user-roles';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum([
    UserRole.ADMIN,
    UserRole.STUDENT,
    UserRole.SUPERVISOR,
    UserRole.COORDINATOR,
  ])
  role: UserRole;

  @IsOptional()
  @IsString()
  university_id?: string;

  @IsOptional()
  @IsString()
  profile_image?: string;
}
