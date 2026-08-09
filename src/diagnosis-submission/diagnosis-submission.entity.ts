import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { Student } from 'src/students/student.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DiagnosisSubmissionStatus } from './enums/diagnosis-submission-status.enum';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { DiagnosisImages } from 'src/diagnosis-images/diagnosis-images.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupervisorReview } from 'src/supervisor-reviews/supervisor-reviews.entity';
import { SubjectDiagnosisAnswer } from 'src/subject-diagnosis/subject-diagnosis-answers.entity';

@Entity('diagnosis_submissions')
export class DiagnosisSubmission {
  @ApiProperty({ description: 'Diagnosis submission ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => ClinicalCase,
    description: 'Associated clinical case',
  })
  @OneToOne(
    () => ClinicalCase,
    (clinicalCase) => clinicalCase.diagnosisSubmission,
  )
  @JoinColumn({ name: 'clinical_case_id' })
  clinicalCase: ClinicalCase;

  @ApiProperty({ type: () => Student, description: 'Submitting student' })
  @ManyToOne(() => Student, (student) => student.diagnosisSubmissions)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ApiProperty({ type: () => Supervisor, description: 'Reviewing supervisor' })
  @ManyToOne(() => Supervisor, (supervisor) => supervisor.diagnosisSubmissions)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @ApiPropertyOptional({
    type: () => [PlannedProcedures],
    description: 'Planned procedures',
  })
  @OneToMany(
    () => PlannedProcedures,
    (plannedProcedure) => plannedProcedure.diagnosisSubmission,
  )
  plannedProcedures: PlannedProcedures[];

  @ApiPropertyOptional({
    type: () => [DiagnosisImages],
    description: 'Diagnosis images',
  })
  @OneToMany(() => DiagnosisImages, (image) => image.diagnosisSubmission)
  images: DiagnosisImages[];

  @ApiPropertyOptional({
    type: SupervisorReview,
    description: 'Associated supervisor review',
  })
  @OneToOne(
    () => SupervisorReview,
    (supervisorReview) => supervisorReview.diagnosisSubmission,
  )
  supervisorReview: SupervisorReview;

  @ApiPropertyOptional({
    type: () => [SubjectDiagnosisAnswer],
    description: 'Answers to subject diagnosis questions',
  })
  @OneToMany(
    () => SubjectDiagnosisAnswer,
    (answer) => answer.diagnosisSubmission,
  )
  answers: SubjectDiagnosisAnswer[];

  @ApiProperty({
    description: 'Submission status',
    enum: DiagnosisSubmissionStatus,
    example: DiagnosisSubmissionStatus.PENDING_REVIEW,
  })
  @Column({
    type: 'enum',
    enum: DiagnosisSubmissionStatus,
    default: DiagnosisSubmissionStatus.PENDING_REVIEW,
  })
  status: DiagnosisSubmissionStatus;

  @ApiProperty({ description: 'Submission timestamp' })
  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
