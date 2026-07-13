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

@Entity('diagnosis_submissions')
export class DiagnosisSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => ClinicalCase,
    (clinicalCase) => clinicalCase.diagnosisSubmission,
  )
  @JoinColumn({ name: 'clinical_case_id' })
  clinicalCase: ClinicalCase;

  @ManyToOne(() => Student, (student) => student.diagnosisSubmissions)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.diagnosisSubmissions)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @OneToMany(
    () => PlannedProcedures,
    (plannedProcedure) => plannedProcedure.diagnosisSubmission,
  )
  plannedProcedures: PlannedProcedures[];

  @OneToMany(() => DiagnosisImages, (image) => image.diagnosisSubmission)
  images: DiagnosisImages[];

  @Column({ type: 'text' })
  clinical_impression: string;

  @Column({
    type: 'enum',
    enum: DiagnosisSubmissionStatus,
    default: DiagnosisSubmissionStatus.PENDING_REVIEW,
  })
  status: DiagnosisSubmissionStatus;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
