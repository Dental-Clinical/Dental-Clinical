import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';
import { ApiProperty } from '@nestjs/swagger';

class NextSessionDto {
  @ApiProperty({
    description: 'The ID of the next treatment session',
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The date of the next treatment session',
    type: Date,
    example: '2023-10-15T10:00:00.000Z',
  })
  appointmentDate: Date;

  @ApiProperty({
    description: 'The start time of the next treatment session',
    type: String,
    example: '10:00 AM',
  })
  startTime: string;
}
class CaseInfo {
  @ApiProperty({
    description: 'The ID of the clinical case',
    type: Number,
    example: 1,
  })
  id: number;
  @ApiProperty({
    description: 'The status of the clinical case',
    type: ClinicalCaseStatus,
    enumName: 'ClinicalCaseStatus',
    example: ClinicalCaseStatus.ASSIGNED,
  })
  status: ClinicalCaseStatus;
  @ApiProperty({
    description: 'The name of the patient',
    type: String,
    example: 'John Doe',
  })
  patientName: string;
  @ApiProperty({
    description: 'The ID of the patient',
    type: Number,
    example: 123,
  })
  patientId: number;
  @ApiProperty({
    description: 'The age of the patient',
    type: Number,
    example: 30,
  })
  patientAge: number;
  @ApiProperty({
    description: 'The gender of the patient',
    type: String,
    example: 'Male',
  })
  patientGender: string;
  @ApiProperty({
    description: 'The subject of the clinical case',
    type: String,
    example: 'Endodontics',
  })
  subject: string;
  @ApiProperty({
    description: 'The name of the supervisor assigned to the case',
    type: String,
    example: 'Dr. Smith',
  })
  supervisor: string;
  @ApiProperty({
    description: 'Information about the next treatment session for the case',
    type: NextSessionDto,
  })
  nextSession: NextSessionDto;
}

class TargetTeeth {
  @ApiProperty({
    description: 'The tooth number for the treatment plan',
    type: Number,
    example: 36,
  })
  tooth: number;
  @ApiProperty({
    description: 'The procedure for the treatment plan',
    type: String,
    example: 'Root Canal Treatment',
  })
  procedure: string;
  @ApiProperty({
    description: 'The status of the planned procedure',
    type: PlannedProceduresStatus,
    enumName: 'PlannedProceduresStatus',
    example: PlannedProceduresStatus.IN_PROGRESS,
  })
  status: PlannedProceduresStatus;
}

class TreatmentPlan {
  @ApiProperty({
    description: 'The target teeth for the treatment plan',
    type: [TargetTeeth],
  })
  targetTeeth: TargetTeeth[];
}

class Materials {
  @ApiProperty({
    description: 'List of materials used in the treatment plan',
    type: [String],
    example: ['Composite Resin', 'Gutta Percha', 'Bonding Agent'],
  })
  materials: string[];
}

class CaseMedia {
  @ApiProperty({
    description: 'The ID of the case media',
    type: Number,
    example: 1,
  })
  id: number;
  @ApiProperty({
    description: 'The type of the case media',
    type: String,
    example: 'image',
  })
  type: string;
  @ApiProperty({
    description: 'The URL of the case media',
    type: String,
    example: 'https://example.com/media/case1/image1.jpg',
  })
  url: string;
  @ApiProperty({
    description: 'The date and time the case media was taken',
    type: Date,
    example: '2023-10-15T10:00:00.000Z',
  })
  takenAt: Date;
}

class Timeline {
  @ApiProperty({
    description: 'The number of the treatment session',
    type: Number,
    example: 2,
  })
  sessionNumber: number;
  @ApiProperty({
    description: 'The status of the treatment session',
    type: TreatmentSessionStatus,
    enumName: 'TreatmentSessionStatus',
    example: TreatmentSessionStatus.UPCOMING,
  })
  status: TreatmentSessionStatus;
  @ApiProperty({
    description: 'The date of the treatment session',
    type: Date,
    example: '2023-10-15T10:00:00.000Z',
  })
  date: Date;
  @ApiProperty({
    description: 'The title of the treatment session',
    type: String,
    example: 'Root Canal Treatment - Session 2',
  })
  title: string;
}

class SupervisorNotes {
  @ApiProperty({
    description: 'The ID of the treatment session',
    type: Number,
    example: 1,
  })
  sessionId: number;
  @ApiProperty({
    description: 'The name of the supervisor',
    type: String,
    example: 'Dr. Smith',
  })
  supervisor: string;
  @ApiProperty({
    description: 'The date and time the notes were created',
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

export class StudentAssignedCaseDetailsDto {
  @ApiProperty({
    description: 'Information about the clinical case',
    type: CaseInfo,
  })
  caseInfo: CaseInfo;
  @ApiProperty({
    description: 'The treatment plan for the clinical case',
    type: TreatmentPlan,
  })
  treatmentPlan: TreatmentPlan;
  @ApiProperty({
    description: 'The materials used in the treatment plan',
    type: Materials,
  })
  materials: Materials;
  @ApiProperty({
    description: 'The media associated with the clinical case',
    type: CaseMedia,
  })
  caseMedia: CaseMedia;
  @ApiProperty({
    description: 'The timeline of treatment sessions for the clinical case',
    type: [Timeline],
  })
  timeline: Timeline[];
  @ApiProperty({
    description: 'The notes provided by the supervisor for the clinical case',
    type: [SupervisorNotes],
  })
  supervisorNotes: SupervisorNotes[];
}
