import { IsDate, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentScheduleDto {
  @ApiProperty({ example: '2026-12-25', description: 'New appointment date' })
  @IsDate()
  appointmentDate: Date;

  @ApiProperty({
    example: '09:00',
    description: 'New appointment start time (HH:mm)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm format',
  })
  appointmentStart: string;
}
