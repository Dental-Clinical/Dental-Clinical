import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePlannedProcedureDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  subjectProcedureId: number;

  @ApiProperty({ example: 16 })
  @IsInt()
  @IsPositive()
  toothNumber?: number;

  @ApiProperty({ example: 'This is a note.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
