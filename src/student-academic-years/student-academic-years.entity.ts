import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { StudentSection } from 'src/student-section/student-section.entity';
import { Student } from 'src/students/student.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** @deprecated Superseded by {@link StudentSubjectEnrollment}. */
@Entity('student_academic_years')
@Unique(['student', 'academicYear'])
export class StudentAcademicYear {
  @ApiProperty({ description: 'Record ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Student, description: 'Associated student' })
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ApiProperty({ description: 'Student ID', example: 1 })
  @RelationId('student')
  student_id: number;

  @ApiProperty({
    type: () => AcademicYear,
    description: 'Associated academic year',
  })
  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ApiProperty({ description: 'Academic year ID', example: 1 })
  @RelationId('academicYear')
  academic_year_id: number;

  @ApiProperty({ type: () => StudyYear, description: 'Associated study year' })
  @ManyToOne(() => StudyYear)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear;

  @ApiProperty({ description: 'Study year ID', example: 1 })
  @RelationId('studyYear')
  study_year_id: number;

  @ApiPropertyOptional({
    type: () => [StudentSection],
    description: 'Student section enrollments',
  })
  @OneToMany(
    () => StudentSection,
    (studentSection) => studentSection.studentAcademicYear,
  )
  studentSections: StudentSection[];

  @ApiProperty({
    description: 'Whether this is the current enrollment',
    example: true,
  })
  @Column({ default: true })
  isCurrent: boolean;

  @ApiProperty({ description: 'Enrollment timestamp' })
  @CreateDateColumn()
  enrolledAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
