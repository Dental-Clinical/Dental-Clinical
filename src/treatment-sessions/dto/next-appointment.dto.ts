import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, Matches } from 'class-validator';

export class NextAppointmentDto {
  @ApiProperty({
    example: '2026-08-15',
  })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    example: '09:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  appointmentStart: string;
}
