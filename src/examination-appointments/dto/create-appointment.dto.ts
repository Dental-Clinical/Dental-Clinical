import { IsDate, IsInt, IsMilitaryTime } from 'class-validator';

export class CreateAppointmentDto {
  @IsDate()
  appointmentDate: Date;

  @IsMilitaryTime()
  appointmentStart: string;

  @IsMilitaryTime()
  appointmentEnd: string;
}
