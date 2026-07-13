import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinColumn } from 'typeorm/browser';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  university_id: string;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.assignedStudent)
  clinicalCases: ClinicalCase[];

  @OneToMany(
    () => StudentAcademicYear,
    (studentAcademicYear) => studentAcademicYear.student,
  )
  studentAcademicYears: StudentAcademicYear[];

  @OneToMany(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.student,
  )
  diagnosisSubmissions: DiagnosisSubmission[];
}
