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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('initial_examinations')
@Unique(['request'])
export class InitialExamination {
  @ApiProperty({ description: 'Initial examination ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => ExaminationRequest,
    description: 'Associated examination request',
  })
  @OneToOne(() => ExaminationRequest, (request) => request.initialExamination)
  @JoinColumn({ name: 'request_id' })
  request: ExaminationRequest;

  @ApiProperty({
    type: () => ExaminationAppointment,
    description: 'Associated examination appointment',
  })
  @OneToOne(
    () => ExaminationAppointment,
    (appointment) => appointment.initialExamination,
  )
  @JoinColumn({ name: 'appointment_id' })
  appointment: ExaminationAppointment;

  @ApiProperty({ type: () => Coordinator, description: 'Assigned coordinator' })
  @ManyToOne(
    () => Coordinator,
    (coordinator) => coordinator.initialExaminations,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator;

  @ApiProperty({ type: () => Subject, description: 'Associated subject' })
  @ManyToOne(() => Subject, (subject) => subject.initialExaminations, {
    nullable: false,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ApiPropertyOptional({
    type: () => ClinicalCase,
    description: 'Associated clinical case',
  })
  @OneToOne(
    () => ClinicalCase,
    (clinicalCase) => clinicalCase.initialExamination,
  )
  clinicalCase: ClinicalCase;

  @ApiProperty({
    description: 'Diagnosis text',
    example: 'Deep caries on tooth 36',
  })
  @Column({ type: 'text' })
  diagnosis: string;

  @ApiProperty({
    description: 'Clinical findings',
    example: 'Large cavity on disto-occlusal surface',
  })
  @Column({ type: 'text' })
  clinicalFindings: string;

  @ApiProperty({
    description: 'Examination status',
    enum: InitialExaminationStatus,
    example: InitialExaminationStatus.IN_PROGRESS,
  })
  @Column({
    type: 'enum',
    enum: InitialExaminationStatus,
    default: InitialExaminationStatus.IN_PROGRESS,
  })
  status: InitialExaminationStatus;

  @ApiPropertyOptional({ description: 'Examination completion timestamp' })
  @Column({
    name: 'examined_at',
    type: 'timestamp',
    nullable: true,
  })
  examined_at: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
