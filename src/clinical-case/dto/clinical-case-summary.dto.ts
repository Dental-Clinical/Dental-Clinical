import { ApiProperty } from '@nestjs/swagger';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class ClinicalCaseSummaryPatientDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ahmad Srour' })
  fullName: string;

  @ApiProperty({ example: '0912345678' })
  phone: string;
}

export class ClinicalCaseSummarySubjectDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Operative Dentistry' })
  name: string;
}

export class ClinicalCaseAssignedStudentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mohee Srour' })
  name: string;
}

export class ClinicalCaseSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ClinicalCaseStatus, example: ClinicalCaseStatus.OPEN })
  status: ClinicalCaseStatus;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: ClinicalCaseSummaryPatientDto })
  patient: ClinicalCaseSummaryPatientDto;

  @ApiProperty({ type: ClinicalCaseSummarySubjectDto })
  subject: ClinicalCaseSummarySubjectDto;

  @ApiProperty({
    type: ClinicalCaseAssignedStudentDto,
    nullable: true,
    description: 'Null when the case has not been assigned to a student yet',
  })
  assignedStudent: ClinicalCaseAssignedStudentDto | null;
}
