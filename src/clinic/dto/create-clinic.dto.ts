import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSectionDto } from 'src/section/dto/create-section.dto';

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

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  sections: CreateSectionDto[];
}
