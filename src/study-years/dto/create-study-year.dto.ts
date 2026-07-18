import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudyYearDto {
  @ApiProperty({ description: 'Study year name', example: 'First Year' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Study year level', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  level: number;
}
