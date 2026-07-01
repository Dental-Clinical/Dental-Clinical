import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/constants/user-roles';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Father name',
    example: 'Michael Doe',
  })
  @IsNotEmpty()
  @IsString()
  father_name: string;

  @ApiPropertyOptional({
    description: 'Password (min 8 characters)',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  @IsString()
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '963912345678',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('SY')
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    example: true,
  })
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  profile_image?: string;
}
