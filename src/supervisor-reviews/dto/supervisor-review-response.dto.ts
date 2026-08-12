import { ApiProperty } from '@nestjs/swagger';

export class PendingReviewItemDto {
  @ApiProperty({ example: 1 })
  submissionId: number;

  @ApiProperty({ example: 1 })
  clinicalCaseId: number;

  @ApiProperty({ example: 'John Doe' })
  patientName: string;

  @ApiProperty({ example: 'Jane Smith' })
  studentName: string;

  @ApiProperty({ example: 3 })
  procedureCount: number;
}

export class PlannedProcedureDetailDto {
  @ApiProperty({ example: 36 })
  toothNumber: number;

  @ApiProperty({ example: 'Root Canal Treatment' })
  procedureName: string;
}

export class ReviewImageDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '/uploads/diagnosis-submissions/image1.jpg' })
  url: string;
}

export class ReviewAnswerDto {
  @ApiProperty({ example: 'Is the tooth sensitive to cold?' })
  question: string;

  @ApiProperty({ example: 'Yes' })
  answer: string;
}

export class SupervisorReviewDetailDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Smith' })
  student: string;

  @ApiProperty({ example: 'John Doe' })
  patient: string;

  @ApiProperty({ type: [ReviewAnswerDto] })
  answers: ReviewAnswerDto[];

  @ApiProperty({ example: 'pending_review' })
  status: string;

  @ApiProperty({ type: [PlannedProcedureDetailDto] })
  plannedProcedures: PlannedProcedureDetailDto[];

  @ApiProperty({ type: [ReviewImageDto] })
  images: ReviewImageDto[];
}

export class GetPendingReviewsResponseDto {
  @ApiProperty({ type: [PendingReviewItemDto] })
  pendingReviews: PendingReviewItemDto[];
}

export class ApproveReviewResponseDto {
  @ApiProperty({ example: 'Diagnosis approved successfully.' })
  message: string;
}

export class ChangeClinicalCaseSubjectResponseDto {
  @ApiProperty({ example: 'Clinical case reassigned successfully.' })
  message: string;

  @ApiProperty({ example: 1 })
  clinicalCaseId: number;

  @ApiProperty({ example: 3 })
  subjectId: number;

  @ApiProperty({ example: 'Endodontics' })
  subjectName: string;
}
