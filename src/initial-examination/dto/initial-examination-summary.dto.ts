import { ApiProperty } from '@nestjs/swagger';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { InitialExaminationStatus } from '../enums/initial-examination-status.enum';

export class InitialExaminationSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ahmad Srour' })
  patient: string;

  @ApiProperty({ example: 'Dr. Lina Haddad' })
  coordinator: string;

  @ApiProperty({ example: 'Operative Dentistry' })
  subject: string;

  @ApiProperty({
    enum: InitialExaminationStatus,
    example: InitialExaminationStatus.COMPLETED,
  })
  status: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  appointmentDate: Date;

  @ApiProperty({ enum: ClinicalCaseStatus, example: ClinicalCaseStatus.OPEN })
  clinicalCaseStatus: ClinicalCaseStatus;
}
