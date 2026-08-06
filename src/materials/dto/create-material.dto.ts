import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Material name',
    example: '37% Phosphoric Acid',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Material description',
    example: 'Tooth-colored restorative material',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
