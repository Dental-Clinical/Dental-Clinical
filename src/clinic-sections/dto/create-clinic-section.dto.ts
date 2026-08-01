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

export class CreateClinicSectionDto {
  @ApiProperty({ description: 'Assigned supervisor ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  supervisor_id: number;

  @ApiProperty({ description: 'Section name', example: 'Section A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Whether the section is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
