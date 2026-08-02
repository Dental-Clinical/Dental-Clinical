import {
  IsDateString,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePatientProfileDto {
  @ApiPropertyOptional({
    description: 'Updated full name',
    example: 'Jane Doe',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({
    description: 'Updated Syrian phone number',
    example: '963912345678',
  })
  @IsOptional()
  @IsPhoneNumber('SY')
  phone?: string;

  @ApiPropertyOptional({
    description: 'Updated date of birth',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Updated gender',
    enum: ['male', 'female'],
    example: 'female',
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'Male', 'Female'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'Updated medical history',
    example: 'Asthma, Allergic to penicillin',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  medical_history?: string;

  @ApiPropertyOptional({
    description: 'Updated current medications',
    example: 'Ventolin inhaler',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  current_medications?: string;

  @ApiPropertyOptional({
    description: 'Updated known allergies',
    example: 'Penicillin',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  allergies?: string;
}
