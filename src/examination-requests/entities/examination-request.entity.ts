import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { ExaminationRequestStatus } from '../Enums/examination-request.enum';
import { ExaminationRequestAttachments } from './examination-request-attachment.entity';
import { Patient } from '../../patients/patient.entity';
import { User } from '../../users/user.entity';

import { ExaminationRequestTeeth } from './examination-request-teeth.entity';
import { Student } from 'src/students/student.entity';
import { ExaminationAppointment } from '../../examination-appointments/examination-appointment.entity';
import { InitialExamination } from '../../initial-examination/initial-examination.entity';
import { ClinicalCase } from '../../clinical-case/clinical-case.entity';

@Entity()
export class ExaminationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'patient_id',
  })
  patient_id: number;

  @ManyToOne(() => Patient, (patient) => patient.examination_requests, {
    nullable: false,
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  chief_complaint: string;

  @Column({
    type: 'enum',
    enum: ExaminationRequestStatus,
    default: ExaminationRequestStatus.PENDING,
  })
  status: ExaminationRequestStatus;

  @OneToOne(
    () => ExaminationAppointment,
    (appointment) => appointment.examination_request,
  )
  appointment: ExaminationAppointment;

  @Column()
  symptoms: string;

  @CreateDateColumn()
  submitted_at: Date;

  @OneToOne(
    () => InitialExamination,
    (initialExamination) => initialExamination.request,
  )
  initialExamination: InitialExamination;

  @OneToOne(() => ClinicalCase, (clinicalCase) => clinicalCase.request)
  clinicalCase: ClinicalCase;

  @OneToMany(
    () => ExaminationRequestAttachments,
    (attachment) => attachment.examination_request,
  )
  attachments: ExaminationRequestAttachments[];

  @OneToMany(
    () => ExaminationRequestTeeth,
    (tooth) => tooth.examination_request,
  )
  teeth: ExaminationRequestTeeth[];
}
