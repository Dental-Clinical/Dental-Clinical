import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { ExaminationRequest } from '../examination-requests/entities/examination-request.entity';
import { User } from '../users/user.entity';
import { ExaminationAppointmentStatus } from '../examination-requests/Enums/examination-appointment.enum';
import { Coordinator } from '../coordinators/coordinator.entity';
import { InitialExamination } from '../initial-examination/initial-examination.entity';

@Entity('examination_appointments')
export class ExaminationAppointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  request_id: number;

  @OneToOne(() => ExaminationRequest, (request) => request.appointment)
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @Column({ nullable: true })
  coordinator_id: number | null;

  @ManyToOne(() => Coordinator, { nullable: false })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator | null;

  @Column({ type: 'enum', enum: ExaminationAppointmentStatus })
  status: ExaminationAppointmentStatus;

  @Column({ type: 'date' })
  appointment_date: Date;

  @Column({ type: 'time' })
  appointment_start: string;

  @Column({ type: 'time' })
  appointment_end: string;

  @OneToOne(
    () => InitialExamination,
    (initialExamination) => initialExamination.appointment,
  )
  initialExamination: InitialExamination;
}
