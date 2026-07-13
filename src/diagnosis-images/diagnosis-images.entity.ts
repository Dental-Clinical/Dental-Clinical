import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('diagnosis_images')
export class DiagnosisImages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.images,
  )
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @Column()
  file_path: string;

  @Column()
  file_name: string;

  @Column()
  mime_type: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
