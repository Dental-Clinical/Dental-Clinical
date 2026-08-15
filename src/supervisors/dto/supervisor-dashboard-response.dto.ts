import { ApiProperty } from '@nestjs/swagger';

export class DashboardProcedureDto {
  @ApiProperty({ description: 'Subject procedure ID', example: 1 })
  procedure_id: number;

  @ApiProperty({ description: 'Procedure name', example: 'Composite Filling' })
  name: string;

  @ApiProperty({ description: 'Required count per student', example: 3 })
  required_count: number;

  @ApiProperty({
    description: 'Number of supervised students enrolled in the subject',
    example: 25,
  })
  students_total: number;

  @ApiProperty({
    description:
      'Number of students who completed the required count of this procedure',
    example: 10,
  })
  students_completed: number;

  @ApiProperty({
    description: 'Total completions of this procedure across all students',
    example: 42,
  })
  total_completed: number;

  @ApiProperty({
    description: 'Total required completions (required_count * students_total)',
    example: 75,
  })
  total_required: number;
}

export class DashboardCaseBucketsDto {
  @ApiProperty({ description: 'Cases under treatment', example: 6 })
  under_treatment: number;

  @ApiProperty({ description: 'Cases awaiting approval', example: 3 })
  awaiting_approval: number;

  @ApiProperty({ description: 'Completed cases', example: 4 })
  completed: number;

  @ApiProperty({ description: 'Cases awaiting final evaluation', example: 1 })
  final_evaluation: number;
}

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total supervised students', example: 50 })
  total_students: number;

  @ApiProperty({ description: 'Number of supervised subjects', example: 2 })
  total_subjects: number;

  @ApiProperty({
    description: 'Total clinical cases linked to supervised students',
    example: 30,
  })
  total_cases: number;
}

export class DashboardSubjectDto {
  @ApiProperty({ description: 'Subject ID', example: 1 })
  subject_id: number;

  @ApiProperty({ description: 'Subject name', example: 'Pediatric Dentistry' })
  subject_name: string;

  @ApiProperty({
    description: 'Number of supervised students enrolled in the subject',
    example: 25,
  })
  students_count: number;

  @ApiProperty({
    type: DashboardCaseBucketsDto,
    description: 'Clinical case counts grouped by status',
  })
  cases: DashboardCaseBucketsDto;

  @ApiProperty({
    type: [DashboardProcedureDto],
    description: 'Procedure completion summary for the subject',
  })
  procedures: DashboardProcedureDto[];
}

export class SupervisorDashboardResponseDto {
  @ApiProperty({ type: DashboardStatsDto, description: 'Overall statistics' })
  stats: DashboardStatsDto;

  @ApiProperty({
    type: [DashboardSubjectDto],
    description: 'Per-subject dashboard details',
  })
  subjects: DashboardSubjectDto[];
}
