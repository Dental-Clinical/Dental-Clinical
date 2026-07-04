import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/constants/user-roles';

export class CreateStaffDto {
  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'staff@clinic.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Staff role',
    enum: [
      UserRole.ADMIN,
      UserRole.STUDENT,
      UserRole.SUPERVISOR,
      UserRole.COORDINATOR,
    ],
    example: UserRole.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum([
    UserRole.ADMIN,
    UserRole.STUDENT,
    UserRole.SUPERVISOR,
    UserRole.COORDINATOR,
  ])
  role: UserRole;

  @ApiPropertyOptional({
    description: 'University ID (for students)',
    example: 'S12345678',
  })
  @IsOptional()
  @IsString()
  university_id?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  profile_image?: string;
}
