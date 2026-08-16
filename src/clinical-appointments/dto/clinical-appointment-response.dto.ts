import { ApiProperty } from '@nestjs/swagger';

export class AvailableSupervisorSlotDto {
  @ApiProperty({ example: 'Dr. Ahmed Hassan' })
  supervisor: string;

  @ApiProperty({ example: '2025-12-25' })
  appointmentDate: Date;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '11:00' })
  endTime: string;
}

export class GetAvailableSupervisorSlotsResponseDto {
  @ApiProperty({ example: 'Available supervisor slots retrieved successfully' })
  message: string;

  @ApiProperty({ type: [AvailableSupervisorSlotDto] })
  data: AvailableSupervisorSlotDto[];
}

export class ClinicalAppointmentDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-12-25' })
  appointmentDate: Date;

  @ApiProperty({ example: '09:00' })
  appointmentStart: string;

  @ApiProperty({ example: '11:00' })
  appointmentEnd: string;

  @ApiProperty({
    example: 'scheduled',
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
  })
  status: string;
}

export class CreateClinicalAppointmentResponseDto {
  @ApiProperty({ example: 'Clinical appointment created successfully' })
  message: string;

  @ApiProperty({ type: ClinicalAppointmentDataDto })
  data: ClinicalAppointmentDataDto;
}

export class UpdateClinicalAppointmentResponseDto {
  @ApiProperty({ example: 'Clinical appointment updated successfully' })
  message: string;

  @ApiProperty({ type: ClinicalAppointmentDataDto })
  data: ClinicalAppointmentDataDto;
}

export class TodayAppointmentDto {
  @ApiProperty({ example: 1 })
  appointmentId: number;

  @ApiProperty({ example: 'John Doe' })
  patient: string;

  @ApiProperty({ example: '9:00 AM' })
  start: string;

  @ApiProperty({ example: 'Upcoming' })
  displayStatus: string;
}

export class GetTodayAppointmentsResponseDto {
  @ApiProperty({ example: "Today's appointments retrieved successfully" })
  message: string;

  @ApiProperty({ type: [TodayAppointmentDto] })
  data: TodayAppointmentDto[];
}

export class UpcomingAppointmentDto {
  @ApiProperty({ example: 1 })
  appointmentId: number;

  @ApiProperty({ example: 7 })
  clinicalCaseId: number;

  @ApiProperty({ example: '2025-12-25' })
  appointmentDate: Date;

  @ApiProperty({ example: '09:00' })
  appointmentStart: string;

  @ApiProperty({ example: '11:00' })
  appointmentEnd: string;

  @ApiProperty({ example: 'Sara Ali' })
  studentName: string;

  @ApiProperty({ example: 'Dr. Ahmed Hassan' })
  supervisorName: string;

  @ApiProperty({
    example: 'scheduled',
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
  })
  status: string;
}

export class GetUpcomingAppointmentsResponseDto {
  @ApiProperty({ example: 'Upcoming appointments retrieved successfully' })
  message: string;

  @ApiProperty({ type: [UpcomingAppointmentDto] })
  data: UpcomingAppointmentDto[];
}

export class StudentUpcomingAppointmentDto {
  @ApiProperty({ example: 1 })
  appointmentId: number;

  @ApiProperty({ example: 7 })
  clinicalCaseId: number;

  @ApiProperty({ example: '2025-12-25' })
  appointmentDate: Date;

  @ApiProperty({ example: '09:00' })
  appointmentStart: string;

  @ApiProperty({ example: '11:00' })
  appointmentEnd: string;

  @ApiProperty({ example: 'Dr. Ahmed Hassan' })
  supervisorName: string;

  @ApiProperty({ example: 'Omar Khaled' })
  patientName: string;

  @ApiProperty({
    example: 'scheduled',
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
  })
  status: string;
}

export class StudentUpcomingAppointmentsDataDto {
  @ApiProperty({ type: [StudentUpcomingAppointmentDto] })
  today: StudentUpcomingAppointmentDto[];

  @ApiProperty({ type: [StudentUpcomingAppointmentDto] })
  upcoming: StudentUpcomingAppointmentDto[];
}

export class GetStudentUpcomingAppointmentsResponseDto {
  @ApiProperty({ example: 'Upcoming appointments retrieved successfully' })
  message: string;

  @ApiProperty({ type: StudentUpcomingAppointmentsDataDto })
  data: StudentUpcomingAppointmentsDataDto;
}

export class PastAppointmentDto {
  @ApiProperty({ example: 1 })
  appointmentId: number;

  @ApiProperty({ example: 7 })
  clinicalCaseId: number;

  @ApiProperty({ example: '2025-12-25' })
  appointmentDate: Date;

  @ApiProperty({ example: '09:00' })
  appointmentStart: string;

  @ApiProperty({ example: '11:00' })
  appointmentEnd: string;

  @ApiProperty({ example: 'Sara Ali' })
  studentName: string;

  @ApiProperty({ example: 'Dr. Ahmed Hassan' })
  supervisorName: string;

  @ApiProperty({
    example: 'completed',
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
  })
  status: string;
}

export class GetPastAppointmentsResponseDto {
  @ApiProperty({ example: 'Past appointments retrieved successfully' })
  message: string;

  @ApiProperty({ type: [PastAppointmentDto] })
  data: PastAppointmentDto[];
}

export class NoShowAppointmentResponseDto {
  @ApiProperty({ example: 'Appointment marked as no-show successfully' })
  message: string;

  @ApiProperty({ type: ClinicalAppointmentDataDto })
  data: ClinicalAppointmentDataDto;
}

export class CancelAppointmentResponseDto {
  @ApiProperty({ example: 'Appointment cancelled successfully' })
  message: string;

  @ApiProperty({ type: ClinicalAppointmentDataDto })
  data: ClinicalAppointmentDataDto;
}

export class RescheduleAppointmentResponseDto {
  @ApiProperty({ example: 'Appointment rescheduled successfully' })
  message: string;

  @ApiProperty({ type: ClinicalAppointmentDataDto })
  data: ClinicalAppointmentDataDto;
}
