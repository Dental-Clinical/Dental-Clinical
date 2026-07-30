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

export class ReviewDetailDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Smith' })
  student: string;

  @ApiProperty({ example: 'John Doe' })
  patient: string;

  @ApiProperty({ example: 'Deep caries on tooth 36' })
  clinicalImpression: string;

  @ApiProperty({ example: 'pending_review' })
  status: string;

  @ApiProperty({ type: [PlannedProcedureDetailDto] })
  plannedProcedures: PlannedProcedureDetailDto[];

  @ApiProperty({ type: [ReviewImageDto] })
  images: ReviewImageDto[];
}

export class GetPendingReviewsResponseDto {
  @ApiProperty({ example: 'Pending reviews retrieved successfully' })
  message: string;

  @ApiProperty({ type: [PendingReviewItemDto] })
  data: PendingReviewItemDto[];
}

export class GetPendingReviewDetailsResponseDto {
  @ApiProperty({ example: 'Review details retrieved successfully' })
  message: string;

  @ApiProperty({ type: ReviewDetailDataDto })
  data: ReviewDetailDataDto;
}

export class ApproveReviewResponseDto {
  @ApiProperty({ example: 'Diagnosis approved successfully.' })
  message: string;
}
