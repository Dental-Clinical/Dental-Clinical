import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { SessionImage } from 'src/session-images/session-images.entity';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { SessionProcedure } from 'src/sesssion-procedures/session-procedures.entity';
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
import { TreatmentSessionStatus } from './enums/treatment-session-status.enum';

@Entity('treatment_sessions')
export class TreatmentSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => ClinicalCase,
    (clinicalCase) => clinicalCase.treatmentSessions,
  )
  @JoinColumn({ name: 'clinical_case_id' })
  clinicalCase: ClinicalCase;

  @OneToOne(() => ClinicalAppointment)
  @JoinColumn({ name: 'clinical_appointment_id' })
  clinicalAppointment: ClinicalAppointment;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  studentNotes?: string;

  @Column({
    type: 'enum',
    enum: TreatmentSessionStatus,
    default: TreatmentSessionStatus.ACTIVE,
  })
  status: TreatmentSessionStatus;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    nullable: true,
  })
  completedAt?: Date;

  @OneToMany(
    () => SessionProcedure,
    (sessionProcedure) => sessionProcedure.treatmentSession,
  )
  sessionProcedures: SessionProcedure[];

  @OneToMany(
    () => SessionMaterial,
    (sessionMaterial) => sessionMaterial.treatmentSession,
  )
  sessionMaterials: SessionMaterial[];

  @OneToMany(
    () => SessionImage,
    (sessionImage) => sessionImage.treatmentSession,
  )
  sessionImages: SessionImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
