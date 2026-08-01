import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateTreatmentSessionDto {
  @ApiPropertyOptional({
    description: 'Treatment title',
    example: 'Root Canal Treatment',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Appointment date in YYYY-MM-DD format',
    example: '2026-08-15',
  })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiPropertyOptional({
    description: 'Appointment start time in HH:MM format',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  appointmentStart?: string;
}
