import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { CaseEvaluationDto } from 'src/clinical-case/dto/case-details-view.dto';

export class SupervisorCaseProcedureDto {
  @ApiProperty({ description: 'Planned procedure ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Procedure name', example: 'Composite Filling' })
  name: string;

  @ApiPropertyOptional({ description: 'Tooth number', example: 36 })
  tooth?: number;
}

export class SupervisorAssignedCaseDto {
  @ApiProperty({ description: 'Clinical case ID', example: 8 })
  id: number;

  @ApiProperty({ description: 'Patient name', example: 'Tarek Fahim' })
  patientName: string;

  @ApiProperty({ description: 'Treating student name', example: 'Omar Nasser' })
  studentName: string;

  @ApiProperty({
    enum: ClinicalCaseStatus,
    description: 'Case status',
    example: ClinicalCaseStatus.COMPLETED,
  })
  status: ClinicalCaseStatus;

  @ApiProperty({
    type: [SupervisorCaseProcedureDto],
    description: 'Procedures planned for the case',
  })
  procedures: SupervisorCaseProcedureDto[];

  @ApiProperty({
    type: CaseEvaluationDto,
    nullable: true,
    description:
      'The final evaluation, or null if the case has not been graded yet',
  })
  evaluation: CaseEvaluationDto | null;
}

export class SupervisorAssignedCasesResponseDto {
  @ApiProperty({
    type: [SupervisorAssignedCaseDto],
    description: 'Clinical cases assigned to the supervisor',
  })
  cases: SupervisorAssignedCaseDto[];
}
