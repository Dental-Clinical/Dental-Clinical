import { Coordinator } from '../coordinators/coordinator.entity';
import { ExaminationAppointment } from '../examination-appointments/examination-appointment.entity';
import { ExaminationRequest } from '../examination-requests/entities/examination-request.entity';
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
import { InitialExaminationStatus } from './enums/initial-examination-status.enum';
import { Subject } from '../subjects/subjects.entity';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';

@Entity('initial_examinations')
@Unique(['request'])
export class InitialExamination {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ExaminationRequest, (request) => request.initialExamination)
  @JoinColumn({ name: 'request_id' })
  request: ExaminationRequest;
  @OneToOne(
    () => ExaminationAppointment,
    (appointment) => appointment.initialExamination,
  )
  @JoinColumn({ name: 'appointment_id' })
  appointment: ExaminationAppointment;

  @ManyToOne(
    () => Coordinator,
    (coordinator) => coordinator.initialExaminations,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator;

  @ManyToOne(() => Subject, (subject) => subject.initialExaminations, {
    nullable: false,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToOne(
    () => ClinicalCase,
    (clinicalCase) => clinicalCase.initialExamination,
  )
  clinicalCase: ClinicalCase;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text' })
  clinicalFindings: string;

  @Column({
    type: 'enum',
    enum: InitialExaminationStatus,
    default: InitialExaminationStatus.IN_PROGRESS,
  })
  status: InitialExaminationStatus;
  @Column({
    name: 'examined_at',
    type: 'timestamp',
    nullable: true,
  })
  examined_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
