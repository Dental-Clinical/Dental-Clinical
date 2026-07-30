import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { NextAppointmentDto } from './next-appointment.dto';
import { Type } from 'class-transformer';

export class CreateTreatmentSessionDto {
  @ApiProperty({ description: 'Clinical case ID', example: 1 })
  @IsNumber()
  clinicalCaseId: number;

  @ApiProperty({
    description: 'Treatment title',
    example: 'Root Canal Treatment',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '2026-08-15',
  })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({
    example: '09:00',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  appointmentStart?: string;
}
