import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('session_images')
export class SessionImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TreatmentSession,
    (treatmentSession) => treatmentSession.sessionImages,
  )
  @JoinColumn({ name: 'treatment_session_id' })
  treatmentSession: TreatmentSession;

  @Column({
    name: 'file_path',
    type: 'varchar',
  })
  filePath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
