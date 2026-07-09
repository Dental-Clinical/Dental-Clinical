import { IsDateString, IsEnum, IsNumber, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ClinicalAppointmentStatus } from "../enums/clinical-appointment.enum";

export class CreateStudentClinicalAppointmentDto {
  @ApiProperty({ example: 1, description: 'Clinical case ID' })
  @IsNumber()
  clinical_case: number

  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsNumber()
  student: number

  @ApiProperty({ example: 1, description: 'Patient ID' })
  @IsNumber()
  patient: number

  @ApiProperty({ example: 1, description: 'Supervisor ID' })
  @IsNumber()
  supervisor: number

  @ApiProperty({ example: '2026-12-25', description: 'Appointment date' })
  @IsDateString()
  appointment_date: Date

  @ApiProperty({ example: '09:00', description: 'Appointment start time (HH:mm)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm format',
  })
  appointment_start: string

  @ApiProperty({ example: '09:30', description: 'Appointment end time (HH:mm)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm format',
  })
  appointment_end: string

  @ApiProperty({
    enum: ClinicalAppointmentStatus,
    example: ClinicalAppointmentStatus.SCHEDULED,
  })
  @IsEnum(ClinicalAppointmentStatus)
  status: ClinicalAppointmentStatus

}
