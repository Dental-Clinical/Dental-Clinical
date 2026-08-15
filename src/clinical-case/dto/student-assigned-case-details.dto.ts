import { ApiProperty } from '@nestjs/swagger';
import {
  CaseDetailsViewDto,
  CaseEvaluationDto,
  SupervisorNoteDto,
} from './case-details-view.dto';

/**
 * The student view: the full case details, including supervisor notes and the
 * student's own evaluation.
 */
export class StudentAssignedCaseDetailsDto extends CaseDetailsViewDto {
  @ApiProperty({
    description: 'The notes provided by supervisors for the clinical case',
    type: [SupervisorNoteDto],
  })
  declare supervisorNotes: SupervisorNoteDto[];

  @ApiProperty({
    description:
      'The final evaluation, or null if the case has not been graded yet',
    type: CaseEvaluationDto,
    nullable: true,
  })
  declare evaluation: CaseEvaluationDto | null;
}
