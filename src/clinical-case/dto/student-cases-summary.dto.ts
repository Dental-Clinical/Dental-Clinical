import { ApiProperty } from '@nestjs/swagger';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';

export class StudentCasesSummaryDto {
  cases: StudentCaseDto[];
}

export class StudentCaseDto {
  @ApiProperty({
    description: 'The ID of the clinical case',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the patient associated with the clinical case',
    example: 'John Doe',
  })
  patientName: string;

  @ApiProperty({
    description: 'The subject associated with the clinical case',
    example: {
      id: 1,
      name: 'Endodontics',
      requiresDentalChart: true,
    },
  })
  subject: {
    id: number;
    name: string;
    requiresDentalChart: boolean;
  };

  @ApiProperty({
    description: 'The status of the clinical case',
    enum: ClinicalCaseStatus,
    example: ClinicalCaseStatus.ASSIGNED,
  })
  status: ClinicalCaseStatus;

  @ApiProperty({
    description:
      'The number of treatment sessions associated with the clinical case',
    example: 5,
  })
  sessionCount: number | null; // This can be null if the case is not yet assigned
}
