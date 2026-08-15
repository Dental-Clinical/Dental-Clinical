import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupervisedSubjectClinicDto {
  @ApiProperty({ description: 'ID of the clinic', type: Number })
  id: number;

  @ApiProperty({ description: 'Name of the clinic', type: String })
  name: string;
}

export class SupervisedSubjectAcademicYearDto {
  @ApiProperty({ description: 'ID of the academic year', type: Number })
  id: number;

  @ApiProperty({
    description: 'Label of the academic year',
    type: String,
    example: '2025/2026',
  })
  label: string;
}

export class SupervisedSubjectSectionDto {
  @ApiProperty({ description: 'ID of the section', type: Number })
  sectionId: number;

  @ApiProperty({ description: 'Name of the section', type: String })
  sectionName: string;

  @ApiProperty({
    description: 'Clinic the section belongs to',
    type: SupervisedSubjectClinicDto,
  })
  clinic: SupervisedSubjectClinicDto;
}

export class SupervisedSubjectProcedureDto {
  @ApiProperty({ description: 'ID of the subject procedure', type: Number })
  procedureId: number;

  @ApiProperty({ description: 'Name of the procedure', type: String })
  procedureName: string;

  @ApiProperty({
    description: 'Number of times a student must complete this procedure',
    type: Number,
    example: 3,
  })
  requiredCount: number;

  @ApiPropertyOptional({
    description: 'Description of the procedure',
    type: String,
  })
  description: string;
}

export class SupervisedSubjectItemDto {
  @ApiProperty({ description: 'ID of the subject', type: Number })
  subjectId: number;

  @ApiProperty({ description: 'Name of the subject', type: String })
  subjectName: string;

  @ApiPropertyOptional({
    description: 'Short name of the subject',
    type: String,
  })
  shortName: string;

  @ApiProperty({
    description: 'Whether the subject requires a dental chart',
    type: Boolean,
  })
  requiresDentalChart: boolean;

  @ApiProperty({
    description: 'Active academic year the assignment belongs to',
    type: SupervisedSubjectAcademicYearDto,
  })
  academicYear: SupervisedSubjectAcademicYearDto;

  @ApiProperty({
    description: 'Sections of this subject supervised by the current supervisor',
    type: [SupervisedSubjectSectionDto],
  })
  sections: SupervisedSubjectSectionDto[];

  @ApiProperty({
    description: 'Required procedures for the subject',
    type: [SupervisedSubjectProcedureDto],
  })
  procedures: SupervisedSubjectProcedureDto[];
}

export class GetSupervisedSubjectsResponseDto {
  @ApiProperty({
    description: 'Subjects supervised by the current supervisor',
    type: [SupervisedSubjectItemDto],
  })
  subjects: SupervisedSubjectItemDto[];
}
