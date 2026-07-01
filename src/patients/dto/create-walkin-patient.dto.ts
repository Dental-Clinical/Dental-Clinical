import {
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
