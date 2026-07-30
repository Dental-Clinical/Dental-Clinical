import { ApiProperty } from '@nestjs/swagger';

export class TreatmentSessionClinicalCaseDto {
  @ApiProperty({ example: 1 })
  id: number;
}

export class TreatmentSessionClinicalAppointmentDto {
  @ApiProperty({ example: 1 })
  id: number;
}

export class TreatmentSessionDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: TreatmentSessionClinicalCaseDto })
  clinicalCase: TreatmentSessionClinicalCaseDto;

  @ApiProperty({ type: TreatmentSessionClinicalAppointmentDto })
  clinicalAppointment: TreatmentSessionClinicalAppointmentDto;

  @ApiProperty({ example: 'Root Canal Treatment' })
  title: string;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'upcoming', 'completed', 'patient_absent'],
  })
  status: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  startedAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class CreateTreatmentSessionResponseDto {
  @ApiProperty({ example: 'Treatment session created successfully.' })
  message: string;

  @ApiProperty({ type: TreatmentSessionDataDto })
  data: TreatmentSessionDataDto;
}

export class TreatmentProgressDto {
  @ApiProperty({ example: 2 })
  completed: number;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 40 })
  percentage: number;
}

export class TreatmentSessionProcedureDto {
  @ApiProperty({ example: 1 })
  plannedProcedureId: number;

  @ApiProperty({ example: 'Root Canal Treatment' })
  name: string;

  @ApiProperty({ example: 36 })
  toothNumber: number;

  @ApiProperty({ example: 'planned' })
  status: string;
}

export class GetTreatmentSessionProceduresResponseDto {
  @ApiProperty({
    example: 'Treatment session procedures retrieved successfully.',
  })
  message: string;

  @ApiProperty({ type: Object })
  data: {
    treatmentSessionId: number;
    clinicalCaseId: number;
    progress: TreatmentProgressDto;
    procedures: TreatmentSessionProcedureDto[];
  };
}

export class CompleteTreatmentSessionResponseDto {
  @ApiProperty({ example: 'Treatment session completed successfully.' })
  message: string;

  @ApiProperty({ type: Object })
  data: {
    treatmentSessionId: number;
    status: string;
  };
}
