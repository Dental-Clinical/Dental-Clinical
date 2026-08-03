import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CaseDetailsViewDto, CaseInfoDto } from './case-details-view.dto';

/**
 * Patients already know who they are, so the patient identity fields are
 * dropped in favour of the student treating them.
 */
export class PatientCaseInfoDto extends OmitType(CaseInfoDto, [
  'patientName',
  'patientId',
  'patientAge',
  'patientGender',
] as const) {
  @ApiProperty({
    description: 'The student treating the case, null while unassigned',
    type: String,
    nullable: true,
    example: 'Sami Haddad',
  })
  declare treatingStudent: string | null;
}

/**
 * The patient view: no supervisor notes — those are internal teaching feedback
 * about the student's performance.
 */
export class PatientCaseDetailsDto extends OmitType(CaseDetailsViewDto, [
  'supervisorNotes',
] as const) {
  @ApiProperty({
    description: 'Information about the clinical case',
    type: PatientCaseInfoDto,
  })
  declare caseInfo: PatientCaseInfoDto;
}
