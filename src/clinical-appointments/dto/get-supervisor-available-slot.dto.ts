import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class GetSupervisorAvailableSlotDto {
  @ApiProperty({
    description: 'Date to check availability (YYYY-MM-DD)',
    example: '2025-12-25',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Subject ID', example: 1 })
  @IsNumber()
  subjectId: number;
}
