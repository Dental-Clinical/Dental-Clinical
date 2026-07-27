import { IsString } from 'class-validator';
import { ExaminationAppointmentStatus } from '../Enums/examination-appointment.enum';

export class ApproveExaminationAppointmentDto {
  @IsString()
  status: ExaminationAppointmentStatus;
}
