import { ApiProperty } from '@nestjs/swagger';
import {
  CaseDetailsViewDto,
  CaseInfoDto,
  SupervisorNoteDto,
} from './case-details-view.dto';

export class SupervisorCaseInfoDto extends CaseInfoDto {
  @ApiProperty({
    description: 'The student treating the case, null while unassigned',
    type: String,
    nullable: true,
    example: 'Sami Haddad',
  })
  declare treatingStudent: string | null;
}

/**
 * The supervisor view: everything the student sees, plus which student is
 * treating the case.
 */
export class SupervisorCaseDetailsDto extends CaseDetailsViewDto {
  @ApiProperty({
    description: 'Information about the clinical case',
    type: SupervisorCaseInfoDto,
  })
  declare caseInfo: SupervisorCaseInfoDto;

  @ApiProperty({
    description: 'The notes provided by supervisors for the clinical case',
    type: [SupervisorNoteDto],
  })
  declare supervisorNotes: SupervisorNoteDto[];
}
