import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaginationMetaDto,
  StudentStudyYearDto,
  StudentUserDto,
} from './student-response.dto';

class SupervisorStudentSectionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'A' })
  name: string;
}

class SupervisorStudentAcademicYearDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024-2025' })
  label: string;
}

class SupervisorStudentSubjectDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Endodontics' })
  name: string;

  @ApiPropertyOptional({ example: 'ENDO' })
  shortName?: string;

  @ApiProperty({
    type: SupervisorStudentSectionDto,
    description: 'The section the student takes this subject in',
  })
  section: SupervisorStudentSectionDto;

  @ApiProperty({
    example: 4,
    description:
      'Credited procedures, capped at the required count of each procedure',
  })
  completedProcedures: number;

  @ApiProperty({
    example: 5,
    description: 'Total required count across the active subject procedures',
  })
  requiredProcedures: number;

  @ApiProperty({
    example: 80,
    description:
      'completedProcedures / requiredProcedures, 0 when nothing is required',
  })
  completionPercentage: number;
}

export class SupervisorStudentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024001' })
  university_id: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ type: StudentUserDto })
  user: StudentUserDto;

  @ApiPropertyOptional({
    type: StudentStudyYearDto,
    nullable: true,
    description: 'Level of the current enrollment, if any',
  })
  studyYear: StudentStudyYearDto | null;

  @ApiProperty({
    type: SupervisorStudentAcademicYearDto,
    description: 'The active academic year the student is enrolled in',
  })
  academicYear: SupervisorStudentAcademicYearDto;

  @ApiProperty({
    type: [SupervisorStudentSubjectDto],
    description: 'Only the subjects this supervisor teaches the student',
  })
  subjects: SupervisorStudentSubjectDto[];
}

export class PaginatedSupervisorStudentsResponseDto {
  @ApiProperty({ type: [SupervisorStudentDto] })
  data: SupervisorStudentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
