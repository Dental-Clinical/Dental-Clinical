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

export class CreatePatientDto {
  @IsInt()
  userId?: number;
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  @IsPhoneNumber('SY')
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  medical_history?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  current_medications?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  allergies?: string;
  @IsOptional()
  @IsBoolean()
  is_walkin?: boolean;
}
