import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStudyYearDto } from './student-response.dto';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { Grade } from 'src/clinical-case-evaluation/enums/grade.enum';

class StudentProfileIdentityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024001' })
  universityId: string;

  @ApiProperty({ description: 'When the student record was created' })
  joinedAt: Date;
}

class StudentProfileUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Omar Nasser' })
  fullName: string;

  @ApiProperty({ example: 'Ahmad' })
  fatherName: string;

  @ApiPropertyOptional({ example: 'omar@example.com', nullable: true })
  email: string;

  @ApiPropertyOptional({ example: '+963912345678', nullable: true })
  phone: string;

  @ApiPropertyOptional({ description: 'Profile image path', nullable: true })
  profileImage: string;

  @ApiProperty({ example: true })
  is_active: boolean;
}

class StudentProfileAcademicYearDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-2026' })
  label: string;
}

class StudentProfileAcademicDto {
  @ApiPropertyOptional({
    type: StudentStudyYearDto,
    nullable: true,
    description: 'Level of the current enrollment, null if not enrolled',
  })
  studyYear: StudentStudyYearDto | null;

  @ApiPropertyOptional({
    type: StudentProfileAcademicYearDto,
    nullable: true,
    description: 'Academic year of the current enrollment, if any',
  })
  academicYear: StudentProfileAcademicYearDto | null;
}

class StudentProfileSectionDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Section B' })
  name: string;
}

class StudentProfileSubjectDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Endodontics' })
  name: string;

  @ApiPropertyOptional({ example: 'Endodon' })
  shortName?: string;

  @ApiProperty({
    type: StudentProfileSectionDto,
    description: 'The section the student takes this subject in',
  })
  section: StudentProfileSectionDto;

  @ApiPropertyOptional({
    example: 'Dr. Rana Khoury',
    nullable: true,
    description: 'Supervisor teaching this subject to the student section',
  })
  supervisor: string | null;

  @ApiProperty({
    example: 5,
    description: 'Supervisor-approved credit earned, capped per procedure',
  })
  completedProcedures: number;

  @ApiProperty({ example: 8, description: 'Credit this subject requires' })
  requiredProcedures: number;

  @ApiProperty({ example: 62.5 })
  completionPercentage: number;
}

class StudentProfileAverageGradeDto {
  @ApiProperty({
    example: 3.35,
    description: 'Average on the 4.0 scale across all case evaluations',
  })
  points: number;

  @ApiProperty({
    enum: Grade,
    example: Grade.B_PLUS,
    description: 'Nearest letter grade to the average',
  })
  letter: Grade;
}

class StudentProfileEvaluationsDto {
  @ApiProperty({ example: 6, description: 'Evaluated cases' })
  count: number;

  @ApiPropertyOptional({
    type: StudentProfileAverageGradeDto,
    nullable: true,
    description: 'Null when the student has no evaluations yet',
  })
  averageGrade: StudentProfileAverageGradeDto | null;

  @ApiProperty({
    description: 'Evaluation count per grade, every grade present',
    example: { 'A+': 1, A: 2, 'A-': 0, 'B+': 3, F: 0 },
  })
  gradeDistribution: Record<Grade, number>;
}

class StudentProfileStatsDto {
  @ApiProperty({ example: 12 })
  totalCases: number;

  @ApiProperty({ example: 5, description: 'Every case not yet completed' })
  activeCases: number;

  @ApiProperty({ example: 7 })
  completedCases: number;

  @ApiProperty({
    description: 'Case count per status, every status present',
    example: { open: 0, assigned: 2, treatment_in_progress: 3, completed: 7 },
  })
  casesByStatus: Record<ClinicalCaseStatus, number>;

  @ApiProperty({
    example: 24,
    description: 'Treatment sessions across all the student cases',
  })
  totalSessions: number;

  @ApiProperty({ example: 18, description: 'Summed across all subjects' })
  completedProcedures: number;

  @ApiProperty({ example: 30, description: 'Summed across all subjects' })
  requiredProcedures: number;

  @ApiProperty({ example: 60 })
  overallCompletionPercentage: number;

  @ApiProperty({ type: StudentProfileEvaluationsDto })
  evaluations: StudentProfileEvaluationsDto;
}

export class StudentProfileResponseDto {
  @ApiProperty({ type: StudentProfileIdentityDto })
  student: StudentProfileIdentityDto;

  @ApiProperty({ type: StudentProfileUserDto })
  user: StudentProfileUserDto;

  @ApiProperty({ type: StudentProfileAcademicDto })
  academic: StudentProfileAcademicDto;

  @ApiProperty({
    type: [StudentProfileSubjectDto],
    description: 'Subjects enrolled in for the active academic year',
  })
  subjects: StudentProfileSubjectDto[];

  @ApiProperty({ type: StudentProfileStatsDto })
  stats: StudentProfileStatsDto;
}
