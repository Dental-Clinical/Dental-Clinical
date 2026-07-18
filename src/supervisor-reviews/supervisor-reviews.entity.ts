import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('supervisor_reviews')
@Unique(['diagnosisSubmission'])
export class SupervisorReview {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.supervisorReview,
  )
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.supervisorReviews)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @CreateDateColumn({ name: 'reviewed_at' })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
