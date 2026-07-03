import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ExaminationRequestsStatus } from '../Enums/examination-request.enum';
import { ExaminationRequestAttachments } from './examination-request-attachment.entity';
import { Patient } from '../../patients/patient.entity';
import { User } from '../../users/user.entity';

@Entity()
export class ExaminationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientId: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  chief_complaint: string;


  @Column({ type: 'enum', enum: ExaminationRequestsStatus, default: ExaminationRequestsStatus.PENDING })
  status: ExaminationRequestsStatus;


  @Column()
  symptoms: string

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  submitted_at: Date;

  @Column({ nullable: true })
  created_by_student: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_student' })
  student: User;

  @OneToMany(() => ExaminationRequestAttachments, (attachment) => attachment.examination_request)
  attachments: ExaminationRequestAttachments[];

  @Column({ type: 'date' })
  appointment_datetime: Date;
}
