import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ExaminationRequest } from './examination-request.entity';
import { User } from '../../users/user.entity';
import { ExaminationAppointmentStatus } from '../Enums/examination-appointment.enum';

@Entity('examination_appointments')
export class ExaminationAppointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  request_id: number;

  @ManyToOne(() => ExaminationRequest)
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @Column({ nullable: true })
  coordinator_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: User | null;

  @Column({ type: 'enum', enum: ExaminationAppointmentStatus })
  status: ExaminationAppointmentStatus;

  @Column({ type: 'date' })
  appointment_datetime: Date;
}
