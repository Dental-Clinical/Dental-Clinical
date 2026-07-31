import { ApiProperty } from '@nestjs/swagger';

export class StudentProcedureProgressItemDto {
  @ApiProperty({ example: 1 })
  subjectProcedureId: number;

  @ApiProperty({ example: 'Restoration' })
  procedure: string;

  @ApiProperty({
    description: 'Procedures credited so far through evaluated clinical cases',
    example: 4,
  })
  completed: number;

  @ApiProperty({
    description: 'Procedures the student must complete for this subject',
    example: 5,
  })
  required: number;
}

export class StudentSubjectProgressDto {
  @ApiProperty({ example: 1 })
  subjectId: number;

  @ApiProperty({ example: 'Operative Dentistry' })
  subject: string;

  @ApiProperty({ type: [StudentProcedureProgressItemDto] })
  procedures: StudentProcedureProgressItemDto[];
}

export class GetStudentProcedureProgressResponseDto {
  @ApiProperty({ example: 'Procedure progress retrieved successfully.' })
  message: string;

  @ApiProperty({ type: [StudentSubjectProgressDto] })
  data: StudentSubjectProgressDto[];
}
