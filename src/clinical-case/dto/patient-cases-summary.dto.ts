import { ApiProperty } from '@nestjs/swagger';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';
import { NextSessionDto } from './case-details-view.dto';

/**
 * The list view of a patient's own cases. Patients already know who they are,
 * so the identity fields carried by the student list are replaced by the
 * people treating them.
 */
export class PatientCaseSummaryDto {
  @ApiProperty({
    description: 'The ID of the clinical case',
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the subject the case belongs to',
    type: String,
    example: 'Endodontics',
  })
  subject: string;

  @ApiProperty({
    description: 'The status of the clinical case',
    enum: ClinicalCaseStatus,
    enumName: 'ClinicalCaseStatus',
    example: ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
  })
  status: ClinicalCaseStatus;

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

  @ApiProperty({
    description: 'The number of treatment sessions recorded for the case',
    type: Number,
    example: 5,
  })
  sessionCount: number;

  @ApiProperty({
    description:
      'The next scheduled appointment for the case, null when none is scheduled',
    type: NextSessionDto,
    nullable: true,
  })
  nextSession: NextSessionDto | null;

  @ApiProperty({
    description: 'The date the case was opened',
    type: Date,
    example: '2023-10-15T10:00:00.000Z',
  })
  createdAt: Date;
}

export class PatientCasesSummaryDto {
  @ApiProperty({
    description: 'The clinical cases belonging to the patient, newest first',
    type: [PatientCaseSummaryDto],
  })
  cases: PatientCaseSummaryDto[];
}
