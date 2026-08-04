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
import { ClinicalCaseEvaluation } from 'src/clinical-case-evaluation/clinical-case-evaluation.entity';
import { StudentProgress } from 'src/student-progress/student-progress.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';

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

  @ApiPropertyOptional({
    type: () => [ClinicalCase],
    description: 'Assigned clinical cases',
  })
  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.assignedStudent)
  clinicalCases: ClinicalCase[];


  @OneToMany(
    () => StudentSubjectEnrollment,
    enrollment => enrollment.student
  )
  subjectEnrollment: StudentSubjectEnrollment[]



  @ApiPropertyOptional({
    type: () => [DiagnosisSubmission],
    description: 'Diagnosis submissions',
  })
  @OneToMany(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.student,
  )
  diagnosisSubmissions: DiagnosisSubmission[];

  @ApiPropertyOptional({
    type: () => [ClinicalCaseEvaluation],
    description: 'Clinical case evaluations',
  })
  @OneToMany(() => ClinicalCaseEvaluation, (evaluation) => evaluation.student)
  clinicalCaseEvaluations: ClinicalCaseEvaluation[];

  @ApiPropertyOptional({
    type: () => [StudentProgress],
    description: 'Subject procedure progress',
  })
  @OneToMany(() => StudentProgress, (progress) => progress.student)
  procedureProgress: StudentProgress[];
}
