import { ApiProperty } from '@nestjs/swagger';

export class DiagnosisSubmissionCreatedDataDto {
  @ApiProperty({ example: 1 })
  diagnosisSubmissionId: number;

  @ApiProperty({ example: 1 })
  clinicalCaseId: number;

  @ApiProperty({ example: 'diagnosis_pending_review' })
  status: string;

  @ApiProperty({ example: 3 })
  answers: number;

  @ApiProperty({ example: 2 })
  plannedProcedures: number;

  @ApiProperty({ example: 3 })
  uploadedImages: number;
}

export class SubmitDiagnosisResponseDto {
  @ApiProperty({
    example: 'Diagnosis submitted successfully for supervisor review.',
  })
  message: string;

  @ApiProperty({ type: DiagnosisSubmissionCreatedDataDto })
  data: DiagnosisSubmissionCreatedDataDto;
}

export class DiagnosisAnswerQuestionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Is the tooth sensitive to cold?' })
  question: string;

  @ApiProperty({ example: 'single-choice' })
  type: string;
}

export class DiagnosisAnswerDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Yes' })
  answer: string;

  @ApiProperty({ type: DiagnosisAnswerQuestionDto })
  question: DiagnosisAnswerQuestionDto;
}

export class DiagnosisPlannedProcedureDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 36 })
  toothNumber: number;

  @ApiProperty({ example: 'planned' })
  status: string;

  @ApiProperty({ example: 'Root Canal Treatment' })
  subjectProcedureName: string;

  @ApiProperty({ type: [DiagnosisAnswerDto] })
  answers: DiagnosisAnswerDto[];
}

export class DiagnosisImageDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '/uploads/diagnosis-submissions/image1.jpg' })
  file_path: string;

  @ApiProperty({ example: 'xray.jpg' })
  file_name: string;
}

export class DiagnosisSubmissionDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'pending_review' })
  status: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  submittedAt: Date;

  @ApiProperty({ type: [DiagnosisPlannedProcedureDto] })
  plannedProcedures: DiagnosisPlannedProcedureDto[];

  @ApiProperty({ type: [DiagnosisImageDto] })
  images: DiagnosisImageDto[];
}

export class GetDiagnosisSubmissionResponseDto {
  @ApiProperty({ example: 'Diagnosis submission retrieved successfully' })
  message: string;

  @ApiProperty({ type: DiagnosisSubmissionDetailDto })
  data: DiagnosisSubmissionDetailDto;
}
