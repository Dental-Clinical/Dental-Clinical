import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectProcedureDto {
  @ApiProperty({ description: 'Associated subject ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  subject_id: number;

  @ApiProperty({ description: 'Procedure name', example: 'Composite Filling' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Procedure description',
    example: 'Direct composite restoration',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Required count', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  required_count: number;

  @ApiPropertyOptional({
    description: 'Whether the procedure is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
