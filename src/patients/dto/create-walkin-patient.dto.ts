import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientWalkinDto {
  @ApiProperty({
    description: 'Full name of the walk-in patient',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Syrian phone number',
    example: '963912345678',
  })
  @IsPhoneNumber('SY')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Date of birth of the walk-in patient',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Gender of the walk-in patient',
    enum: ['male', 'female'],
    example: 'female',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiPropertyOptional({
    description: 'Patient medical history',
    example: 'Diabetes, High blood pressure',
  })
  @IsOptional()
  @IsString()
  medical_history?: string;

  @ApiPropertyOptional({
    description: 'Current medications',
    example: 'Metformin 500mg',
  })
  @IsOptional()
  @IsString()
  current_medications?: string;

  @ApiPropertyOptional({
    description: 'Known allergies',
    example: 'Penicillin, Aspirin',
  })
  @IsOptional()
  @IsString()
  allergies?: string;
}
