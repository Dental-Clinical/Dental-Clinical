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
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ type: () => AcademicYear, description: 'Associated academic year' })
  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ApiProperty({ type: () => StudyYear, description: 'Associated study year' })
  @ManyToOne(() => StudyYear)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear;

  @ApiPropertyOptional({ type: () => [StudentSection], description: 'Student section enrollments' })
  @OneToMany(
    () => StudentSection,
    (studentSection) => studentSection.studentAcademicYear,
  )
  studentSections: StudentSection[];

  @ApiProperty({ description: 'Whether this is the current enrollment', example: true })
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
