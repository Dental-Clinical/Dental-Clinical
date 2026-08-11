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

export class CreateSubjectDto {
  @ApiProperty({ description: 'Associated study year ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  study_year_id: number;

  @ApiProperty({
    description: 'Subject name',
    example: 'Restorative Dentistry',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Subject short name or abbreviation',
    example: 'Restorative Dent.',
  })
  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsBoolean()
  requiresDentalChart: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether the subject is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'ID of the clinic the subject belongs to',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  clinic_id: number;
}
