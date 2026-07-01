import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiPropertyOptional({ description: 'User ID to link patient to', example: 1 })
  @IsInt()
  userId?: number;

  @ApiProperty({ description: 'Full name', example: 'Jane Doe', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ description: 'Syrian phone number', example: '963912345678' })
  @IsPhoneNumber('SY')
  phone: string;

  @ApiPropertyOptional({ description: 'Medical history', example: 'Diabetes', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  medical_history?: string;

  @ApiPropertyOptional({ description: 'Current medications', example: 'Metformin', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  current_medications?: string;

  @ApiPropertyOptional({ description: 'Known allergies', example: 'Penicillin', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  allergies?: string;

  @ApiPropertyOptional({ description: 'Is walk-in patient', example: false })
  @IsOptional()
  @IsBoolean()
  is_walkin?: boolean;
}
