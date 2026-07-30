import { ApiProperty } from '@nestjs/swagger';
import { ClinicalCaseStatus } from '../enums/clinical-case-status.enum';
import { ClinicalCaseAssignedStudentDto } from './clinical-case-summary.dto';

export class ClinicalCaseDetailsPatientDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ahmad Srour' })
  fullName: string;

  @ApiProperty({ example: '0912345678' })
  phone: string;

  @ApiProperty({ example: 'Hypertension', nullable: true })
  medicalHistory: string;

  @ApiProperty({ example: 'Penicillin', nullable: true })
  allergies: string;

  @ApiProperty({ example: 'Lisinopril 10mg', nullable: true })
  currentMedications: string;
}

export class ClinicalCaseDetailsRequestDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Toothache in lower left molar' })
  chiefComplaint: string;

  @ApiProperty({ example: 'Sensitivity to cold, pain when chewing' })
  symptoms: string;
}

export class ClinicalCaseDetailsSubjectDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Operative Dentistry' })
  name: string;
}

export class ClinicalCaseDetailsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ClinicalCaseStatus, example: ClinicalCaseStatus.OPEN })
  status: ClinicalCaseStatus;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: ClinicalCaseDetailsPatientDto })
  patient: ClinicalCaseDetailsPatientDto;

  @ApiProperty({ type: ClinicalCaseDetailsRequestDto })
  patient_request: ClinicalCaseDetailsRequestDto;

  @ApiProperty({ type: ClinicalCaseDetailsSubjectDto })
  subject: ClinicalCaseDetailsSubjectDto;

  @ApiProperty({
    type: ClinicalCaseAssignedStudentDto,
    nullable: true,
    description: 'Null when the case has not been assigned to a student yet',
  })
  assignedStudent: ClinicalCaseAssignedStudentDto | null;
}
