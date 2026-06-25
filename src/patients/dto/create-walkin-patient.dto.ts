import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreatePatientWalkinDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsPhoneNumber('SY')
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  medical_history?: string;

  @IsOptional()
  @IsString()
  current_medications?: string;

  @IsOptional()
  @IsString()
  allergies?: string;
}
