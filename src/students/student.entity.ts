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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('students')
export class Student {
  @ApiProperty({ description: 'Student ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'Associated user account' })
  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'University ID', example: '2024001' })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  university_id: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiPropertyOptional({ type: () => [ClinicalCase], description: 'Assigned clinical cases' })
  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.assignedStudent)
  clinicalCases: ClinicalCase[];

  @ApiPropertyOptional({ type: () => [StudentAcademicYear], description: 'Academic year enrollments' })
  @OneToMany(
    () => StudentAcademicYear,
    (studentAcademicYear) => studentAcademicYear.student,
  )
  studentAcademicYears: StudentAcademicYear[];

  @ApiPropertyOptional({ type: () => [DiagnosisSubmission], description: 'Diagnosis submissions' })
  @OneToMany(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.student,
  )
  diagnosisSubmissions: DiagnosisSubmission[];
}
