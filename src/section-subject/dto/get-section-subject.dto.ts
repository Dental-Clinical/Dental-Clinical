import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: '2023/2024' })
  label: string;
}

export class ClinicDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'Clinic Name' })
  name: string;
}

export class SectionDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'Section Name' })
  name: string;
}

export class SubjectDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'Subject Name' })
  name: string;
}

export class SupervisorDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'Supervisor Name' })
  fullName: string;
}
export class AssignmentDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ type: AcademicYearDto })
  academicYear: AcademicYearDto;

  @ApiProperty({ type: ClinicDto })
  clinic: ClinicDto;

  @ApiProperty({ type: SectionDto })
  section: SectionDto;

  @ApiProperty({ type: SubjectDto })
  subject: SubjectDto;

  @ApiProperty({ type: SupervisorDto })
  supervisor: SupervisorDto;
}

export class AssignmentResponseDto {
  @ApiProperty({ example: 'Section subject retrieved successfully' })
  message: string;
  @ApiProperty({ type: [AssignmentDto] })
  assignments: [AssignmentItemResponseDto];
}

export class AssignmentItemResponseDto {
  @ApiProperty({ example: 'Section subject retrieved successfully' })
  message: string;

  @ApiProperty({ type: AssignmentDto })
  assignment: AssignmentDto;
}
