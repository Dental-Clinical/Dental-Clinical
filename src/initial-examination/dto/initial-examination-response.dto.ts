import { ApiProperty } from '@nestjs/swagger';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { InitialExaminationStatus } from '../enums/initial-examination-status.enum';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';

export class InitialExaminationRequestSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: ExaminationRequestStatus,
    example: ExaminationRequestStatus.CONVERTED_TO_CASE,
  })
  status: ExaminationRequestStatus;
}

export class InitialExaminationClinicalCaseSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ClinicalCaseStatus, example: ClinicalCaseStatus.OPEN })
  status: ClinicalCaseStatus;
}

export class InitialExaminationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Deep caries on tooth 36' })
  diagnosis: string;

  @ApiProperty({ example: 'Sensitivity to percussion, no swelling' })
  clinicalFindings: string;

  @ApiProperty({
    enum: InitialExaminationStatus,
    example: InitialExaminationStatus.COMPLETED,
  })
  status: InitialExaminationStatus;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  examinedAt: Date;

  @ApiProperty({ type: InitialExaminationRequestSummaryDto })
  request?: InitialExaminationRequestSummaryDto;

  @ApiProperty({ type: InitialExaminationClinicalCaseSummaryDto })
  clinicalCase: InitialExaminationClinicalCaseSummaryDto;
}
