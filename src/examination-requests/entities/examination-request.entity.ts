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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class ExaminationRequest {
  @ApiProperty({ description: 'Examination request ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Patient ID', example: 1 })
  @Column({
    name: 'patient_id',
  })
  patient_id: number;

  @ApiProperty({ type: () => Patient, description: 'Associated patient' })
  @ManyToOne(() => Patient, (patient) => patient.examination_requests, {
    nullable: false,
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiPropertyOptional({
    description: 'Chief complaint',
    example: 'Toothache on upper left',
  })
  @Column({ nullable: true })
  chief_complaint: string;

  @ApiProperty({
    description: 'Request status',
    enum: ExaminationRequestStatus,
    example: ExaminationRequestStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ExaminationRequestStatus,
    default: ExaminationRequestStatus.PENDING,
  })
  status: ExaminationRequestStatus;

  @ApiPropertyOptional({
    type: () => ExaminationAppointment,
    description: 'Associated examination appointment',
  })
  @OneToOne(
    () => ExaminationAppointment,
    (appointment) => appointment.examination_request,
  )
  appointment: ExaminationAppointment;

  @ApiProperty({
    description: 'Symptoms description',
    example: 'Severe pain when eating hot food',
  })
  @Column()
  symptoms: string;

  @ApiProperty({ description: 'Submission timestamp' })
  @CreateDateColumn()
  submitted_at: Date;

  @ApiPropertyOptional({
    type: () => InitialExamination,
    description: 'Associated initial examination',
  })
  @OneToOne(
    () => InitialExamination,
    (initialExamination) => initialExamination.request,
  )
  initialExamination: InitialExamination;

  @ApiPropertyOptional({
    type: () => ClinicalCase,
    description: 'Associated clinical case',
  })
  @OneToOne(() => ClinicalCase, (clinicalCase) => clinicalCase.request)
  clinicalCase: ClinicalCase;

  @ApiPropertyOptional({
    type: () => [ExaminationRequestAttachments],
    description: 'Request attachments',
  })
  @OneToMany(
    () => ExaminationRequestAttachments,
    (attachment) => attachment.examination_request,
  )
  attachments: ExaminationRequestAttachments[];

  @ApiPropertyOptional({
    type: () => [ExaminationRequestTeeth],
    description: 'Affected teeth',
  })
  @OneToMany(
    () => ExaminationRequestTeeth,
    (tooth) => tooth.examination_request,
  )
  teeth: ExaminationRequestTeeth[];
}
