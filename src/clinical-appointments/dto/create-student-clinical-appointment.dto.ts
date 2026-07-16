import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClinicalAppointmentStatus } from '../enums/clinical-appointment.enum';

export class CreateStudentClinicalAppointmentDto {
  @ApiProperty({ example: 1, description: 'Clinical case ID' })
  @IsNumber()
  clinicalCaseId: number;

  @ApiProperty({ example: '2026-12-25', description: 'Appointment date' })
  @IsDate()
  appointmentDate: Date;

  @ApiProperty({
    example: '09:00',
    description: 'Appointment start time (HH:mm)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm format',
  })
  appointmentStart: string;
}
