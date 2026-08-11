import { ApiProperty } from '@nestjs/swagger';
import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { TreatmentSessionStatus } from '../enums/treatment-session-status.enum';

/**
 * The list view of a patient's own treatment sessions. Patients already know
 * who they are, so the session carries the case it belongs to and the people
 * treating them instead.
 *
 * Neither this view nor the details view carries `studentNotes` or
 * `supervisorNotes`: those are internal clinical documentation and teaching
 * feedback about the student's performance.
 */
export class PatientSessionSummaryDto {
  @ApiProperty({
    description: 'The ID of the treatment session',
    type: Number,
    example: 7,
  })
  id: number;

  @ApiProperty({
    description: 'The title of the treatment session',
    type: String,
    example: 'Root Canal Treatment - Session 2',
  })
  title: string;

  @ApiProperty({
    description: 'The status of the treatment session',
    enum: TreatmentSessionStatus,
    enumName: 'TreatmentSessionStatus',
    example: TreatmentSessionStatus.UPCOMING,
  })
  status: TreatmentSessionStatus;

  @ApiProperty({
    description: 'The ID of the clinical case the session belongs to',
    type: Number,
    example: 3,
  })
  caseId: number;

  @ApiProperty({
    description: 'The name of the subject the case belongs to',
    type: String,
    example: 'Endodontics',
  })
  subject: string;

  @ApiProperty({
    description: 'The student treating the case, null while unassigned',
    type: String,
    nullable: true,
    example: 'Sami Haddad',
  })
  treatingStudent: string | null;

  @ApiProperty({
    description: 'The supervisor overseeing the case, null while unassigned',
    type: String,
    nullable: true,
    example: 'Dr. Smith',
  })
  supervisor: string | null;

  // Postgres `date` column — serialized as a date-only string, not a timestamp.
  @ApiProperty({
    description:
      'The date of the session appointment, null when the session has no appointment',
    type: String,
    format: 'date',
    nullable: true,
    example: '2026-08-12',
  })
  appointmentDate: string | null;

  @ApiProperty({
    description:
      'The start time of the session appointment, null when the session has no appointment',
    type: String,
    nullable: true,
    example: '10:00',
  })
  startTime: string | null;

  @ApiProperty({
    description: 'The date the treatment session was created',
    type: Date,
    example: '2026-08-01T09:00:00.000Z',
  })
  createdAt: Date;
}

export class PatientSessionsSummaryDto {
  @ApiProperty({
    description:
      'The treatment sessions belonging to the patient, newest first',
    type: [PatientSessionSummaryDto],
  })
  sessions: PatientSessionSummaryDto[];
}

export class PatientSessionProcedureDto {
  @ApiProperty({
    description: 'The ID of the planned procedure performed in the session',
    type: Number,
    example: 12,
  })
  id: number;

  @ApiProperty({
    description: 'The procedure performed',
    type: String,
    example: 'Root Canal Treatment',
  })
  name: string;

  @ApiProperty({
    description: 'The tooth number the procedure was performed on',
    type: Number,
    example: 36,
  })
  tooth: number | null;

  @ApiProperty({
    description: 'The status of the planned procedure',
    enum: PlannedProceduresStatus,
    enumName: 'PlannedProceduresStatus',
    example: PlannedProceduresStatus.COMPLETED,
  })
  status: PlannedProceduresStatus;
}

/**
 * The details view of a single session: the summary plus the appointment
 * window and what was actually performed.
 */
export class PatientSessionDetailsDto extends PatientSessionSummaryDto {
  @ApiProperty({
    description:
      'The end time of the session appointment, null when the session has no appointment',
    type: String,
    nullable: true,
    example: '11:00',
  })
  endTime: string | null;

  @ApiProperty({
    description:
      'The status of the session appointment, null when the session has no appointment',
    enum: ClinicalAppointmentStatus,
    enumName: 'ClinicalAppointmentStatus',
    nullable: true,
    example: ClinicalAppointmentStatus.SCHEDULED,
  })
  appointmentStatus: ClinicalAppointmentStatus | null;

  @ApiProperty({
    description:
      'The date and time the session was started, null while it has not started',
    type: Date,
    nullable: true,
    example: '2026-08-12T10:02:00.000Z',
  })
  startedAt: Date | null;

  @ApiProperty({
    description:
      'The date and time the session was completed, null while it is not completed',
    type: Date,
    nullable: true,
    example: '2026-08-12T10:55:00.000Z',
  })
  completedAt: Date | null;

  @ApiProperty({
    description:
      'The procedures performed during the session, empty when none were recorded',
    type: [PatientSessionProcedureDto],
  })
  procedures: PatientSessionProcedureDto[];
}
