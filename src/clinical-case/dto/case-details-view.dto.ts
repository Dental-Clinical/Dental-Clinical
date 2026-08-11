import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class NextSessionDto {
  @ApiProperty({
    description: 'The ID of the next scheduled appointment',
    type: Number,
    example: 1,
  })
  id: number;

  // Postgres `date` column — serialized as a date-only string, not a timestamp.
  @ApiProperty({
    description: 'The date of the next appointment',
    type: String,
    format: 'date',
    example: '2023-10-15',
  })
  appointmentDate: string;

  @ApiProperty({
    description: 'The start time of the next appointment',
    type: String,
    example: '10:00 AM',
  })
  startTime: string;
}

export class CaseInfoDto {
  @ApiProperty({
    description: 'The ID of the clinical case',
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The status of the clinical case',
    enum: ClinicalCaseStatus,
    enumName: 'ClinicalCaseStatus',
    example: ClinicalCaseStatus.ASSIGNED,
  })
  status: ClinicalCaseStatus;

  @ApiProperty({
    description: 'The subject of the clinical case',
    type: String,
    example: 'Endodontics',
  })
  subject: string;

  @ApiProperty({
    description:
      'The name of the supervisor assigned to the case, null while unassigned',
    type: String,
    nullable: true,
    example: 'Dr. Smith',
  })
  supervisor: string | null;

  @ApiProperty({
    description:
      'The next scheduled appointment for the case, null when none is scheduled',
    type: NextSessionDto,
    nullable: true,
  })
  nextSession: NextSessionDto | null;

  @ApiPropertyOptional({
    description: 'The name of the patient. Hidden from the patient view.',
    type: String,
    example: 'John Doe',
  })
  patientName?: string;

  @ApiPropertyOptional({
    description: 'The ID of the patient. Hidden from the patient view.',
    type: Number,
    example: 123,
  })
  patientId?: number;

  @ApiPropertyOptional({
    description:
      'The age of the patient, null when date of birth is unknown. Hidden from the patient view.',
    type: Number,
    nullable: true,
    example: 30,
  })
  patientAge?: number | null;

  @ApiPropertyOptional({
    description:
      'The gender of the patient, null when unknown. Hidden from the patient view.',
    type: String,
    nullable: true,
    example: 'Male',
  })
  patientGender?: string | null;

  @ApiPropertyOptional({
    description:
      'The student treating the case, null while unassigned. Not included in the student view.',
    type: String,
    nullable: true,
    example: 'Sami Haddad',
  })
  treatingStudent?: string | null;
}

export class TargetTeethDto {
  @ApiProperty({
    description: 'The ID of the planned procedure',
    type: Number,
    example: 12,
  })
  procedureId: number;

  @ApiProperty({
    description: 'The procedure for the treatment plan',
    type: String,
    example: 'Root Canal Treatment',
  })
  procedure: string;

  @ApiProperty({
    description: 'The tooth number for the treatment plan',
    type: Number,
    example: 36,
  })
  tooth?: number;

  @ApiProperty({
    description: 'The status of the planned procedure',
    enum: PlannedProceduresStatus,
    enumName: 'PlannedProceduresStatus',
    example: PlannedProceduresStatus.IN_PROGRESS,
  })
  status: PlannedProceduresStatus;
}

export class TreatmentPlanDto {
  @ApiProperty({
    description:
      'The target teeth for the treatment plan, empty while no diagnosis has been submitted',
    type: [TargetTeethDto],
  })
  targetTeeth: TargetTeethDto[];
}

export class MaterialDto {
  @ApiProperty({
    description: 'The ID of the material',
    type: Number,
    example: 4,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the material',
    type: String,
    example: 'Composite Resin',
  })
  name: string;
}

export class CaseMediaDto {
  @ApiProperty({
    description: 'The ID of the case media',
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The MIME type of the case media',
    type: String,
    example: 'image/jpeg',
  })
  type: string;

  @ApiProperty({
    description: 'The URL of the case media',
    type: String,
    example: 'https://example.com/media/case1/image1.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'The original file name of the case media',
    type: String,
    example: 'periapical-36.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'The description of the case media',
    type: String,
    nullable: true,
    example: 'Pre-operative periapical radiograph',
  })
  description: string | null;

  @ApiProperty({
    description: 'The date and time the case media was uploaded',
    type: Date,
    example: '2023-10-15T10:00:00.000Z',
  })
  takenAt: Date;
}

export class TimelineEntryDto {
  @ApiProperty({
    description: 'The ID of the treatment session',
    type: Number,
    example: 7,
  })
  sessionId: number;

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

  // Postgres `date` column — serialized as a date-only string, not a timestamp.
  @ApiProperty({
    description:
      'The date of the session appointment, null when the session has no appointment',
    type: String,
    format: 'date',
    nullable: true,
    example: '2023-10-15',
  })
  appointmentDate: string | null;

  @ApiProperty({
    description:
      'The start time of the session appointment, null when the session has no appointment',
    type: String,
    nullable: true,
    example: '10:00 AM',
  })
  startTime: string | null;
}

export class SupervisorNoteDto {
  @ApiProperty({
    description: 'The ID of the treatment session',
    type: Number,
    example: 1,
  })
  sessionId: number;

  @ApiProperty({
    description: 'The title of the treatment session',
    type: String,
    example: 'Root Canal Treatment - Session 2',
  })
  sessionTitle: string;

  @ApiProperty({
    description: 'The name of the supervisor who wrote the note',
    type: String,
    nullable: true,
    example: 'Dr. Smith',
  })
  supervisor: string | null;

  @ApiProperty({
    description: 'The date and time the note was last updated',
    type: Date,
    example: '2023-10-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The notes provided by the supervisor',
    type: String,
    example:
      'The patient is responding well to the treatment. Continue with the current plan.',
  })
  notes: string;
}

/**
 * The widest shape of the case details view. Each actor sees a subset of it,
 * governed by CASE_VIEW_POLICY — see the per-actor DTOs for the narrowed
 * contracts published on each route.
 */
export class CaseDetailsViewDto {
  @ApiProperty({
    description: 'Information about the clinical case',
    type: CaseInfoDto,
  })
  caseInfo: CaseInfoDto;

  @ApiProperty({
    description: 'The treatment plan for the clinical case',
    type: TreatmentPlanDto,
  })
  treatmentPlan: TreatmentPlanDto;

  @ApiProperty({
    description: 'The distinct materials used across the case sessions',
    type: [MaterialDto],
  })
  materials: MaterialDto[];

  @ApiProperty({
    description: 'The media associated with the clinical case',
    type: [CaseMediaDto],
  })
  caseMedia: CaseMediaDto[];

  @ApiProperty({
    description: 'The timeline of treatment sessions for the clinical case',
    type: [TimelineEntryDto],
  })
  timeline: TimelineEntryDto[];

  @ApiPropertyOptional({
    description:
      'The notes provided by supervisors. Omitted entirely from the patient view.',
    type: [SupervisorNoteDto],
  })
  supervisorNotes?: SupervisorNoteDto[];
}
