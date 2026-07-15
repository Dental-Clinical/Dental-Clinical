import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class GetAvailableSlotDto {
  @ApiProperty({
    description: 'Date to check availability (YYYY-MM-DD)',
    example: '2025-12-25',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Clinical case ID', example: 1 })
  @IsNumber()
  clinicalCaseId: number;
}
