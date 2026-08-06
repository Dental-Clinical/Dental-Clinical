import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({
    description: 'Clinic name',
    example: 'Conservative Dentistry Clinic',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Clinic description',
    example: 'Main teaching clinic',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
