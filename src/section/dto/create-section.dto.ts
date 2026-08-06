import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section name', example: 'Section A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'ID of the clinic the section belongs to',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  clinic_id: number;

  @ApiPropertyOptional({
    description: 'Whether the section is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
