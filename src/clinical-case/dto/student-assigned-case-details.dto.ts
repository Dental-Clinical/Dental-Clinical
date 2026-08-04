import { ApiProperty } from '@nestjs/swagger';
import { CaseDetailsViewDto, SupervisorNoteDto } from './case-details-view.dto';

/**
 * The student view: the full case details, including supervisor notes.
 */
export class StudentAssignedCaseDetailsDto extends CaseDetailsViewDto {
  @ApiProperty({
    description: 'The notes provided by supervisors for the clinical case',
    type: [SupervisorNoteDto],
  })
  declare supervisorNotes: SupervisorNoteDto[];
}
