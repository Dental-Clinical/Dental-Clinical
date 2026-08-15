import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStudyYearDto } from './student-response.dto';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';

class SupervisedStudentNameDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Omar Nasser' })
  full_name: string;
}

class SupervisedStudentSectionDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Section B' })
  name: string;
}

class SupervisedStudentAcademicYearDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-2026' })
  label: string;
}

class SupervisedStudentProcedureDto {
  @ApiProperty({ example: 8 })
  id: number;

  @ApiProperty({ example: 'Single-Canal Root Canal Treatment' })
  name: string;

  @ApiProperty({
    example: 2,
    description: 'Supervisor-approved credit earned on this procedure',
  })
  completed: number;

  @ApiProperty({ example: 3, description: 'Credit the procedure requires' })
  required: number;
}

class SupervisedStudentCaseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Layla Haddad' })
  patientName: string;

  @ApiProperty({
    enum: ClinicalCaseStatus,
    example: ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
  })
  status: ClinicalCaseStatus;

  @ApiProperty({
    example: 3,
    description: 'Treatment sessions recorded on this case',
  })
  sessionCount: number;

  @ApiProperty({ description: 'Case creation timestamp' })
  createdAt: Date;
}

class SupervisedStudentDetailSubjectDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Endodontics' })
  name: string;

  @ApiPropertyOptional({ example: 'Endodon' })
  shortName?: string;

  @ApiProperty({
    type: SupervisedStudentSectionDto,
    description: 'The section the student takes this subject in',
  })
  section: SupervisedStudentSectionDto;

  @ApiProperty({
    example: 5,
    description: 'Sum of the procedure credit below, capped per procedure',
  })
  completedProcedures: number;

  @ApiProperty({ example: 8, description: 'Sum of the required counts below' })
  requiredProcedures: number;

  @ApiProperty({ example: 62.5 })
  completionPercentage: number;

  @ApiProperty({
    type: [SupervisedStudentProcedureDto],
    description: 'Active procedures this subject requires',
  })
  procedures: SupervisedStudentProcedureDto[];

  @ApiProperty({
    type: [SupervisedStudentCaseDto],
    description:
      "The student's cases in this subject under this supervisor, newest first",
  })
  cases: SupervisedStudentCaseDto[];
}

export class SupervisedStudentDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: SupervisedStudentNameDto })
  user: SupervisedStudentNameDto;

  @ApiPropertyOptional({
    type: StudentStudyYearDto,
    nullable: true,
    description: 'Level of the current enrollment, if any',
  })
  studyYear: StudentStudyYearDto | null;

  @ApiProperty({ type: SupervisedStudentAcademicYearDto })
  academicYear: SupervisedStudentAcademicYearDto;

  @ApiProperty({
    type: [SupervisedStudentDetailSubjectDto],
    description: 'Only the subjects this supervisor teaches the student',
  })
  subjects: SupervisedStudentDetailSubjectDto[];
}
