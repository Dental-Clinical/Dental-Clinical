import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  registrationToken: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(55)
  full_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(55)
  father_name: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsString()
  gender: 'male' | 'female';
}
