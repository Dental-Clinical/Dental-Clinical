import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { Student } from 'src/students/student.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('student_academic_years')
@Unique(['student', 'academicYear'])
export class StudentAcademicYear {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => StudyYear)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear;

  @Column({ default: true })
  isCurrent: boolean;

  @CreateDateColumn()
  enrolledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
