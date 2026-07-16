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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('examination_appointments')
export class ExaminationAppointment {
  @ApiProperty({ description: 'Examination appointment ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Request ID', example: 1 })
  @Column()
  request_id: number;

  @ApiProperty({
    type: () => ExaminationRequest,
    description: 'Associated examination request',
  })
  @OneToOne(() => ExaminationRequest, (request) => request.appointment)
  @JoinColumn({ name: 'request_id' })
  examination_request: ExaminationRequest;

  @ApiPropertyOptional({ description: 'Coordinator ID', example: 1 })
  @Column({ nullable: true })
  coordinator_id: number | null;

  @ApiProperty({ type: () => Coordinator, description: 'Assigned coordinator' })
  @ManyToOne(() => Coordinator, { nullable: false })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator | null;

  @ApiProperty({
    description: 'Appointment status',
    enum: ExaminationAppointmentStatus,
    example: ExaminationAppointmentStatus.SCHEDULED,
  })
  @Column({ type: 'enum', enum: ExaminationAppointmentStatus })
  status: ExaminationAppointmentStatus;

  @ApiProperty({ description: 'Appointment date', example: '2025-01-15' })
  @Column({ type: 'date' })
  appointment_date: Date;

  @ApiProperty({ description: 'Appointment start time', example: '09:00' })
  @Column({ type: 'time' })
  appointment_start: string;

  @ApiProperty({ description: 'Appointment end time', example: '10:00' })
  @Column({ type: 'time' })
  appointment_end: string;

  @ApiPropertyOptional({
    type: () => InitialExamination,
    description: 'Associated initial examination',
  })
  @OneToOne(
    () => InitialExamination,
    (initialExamination) => initialExamination.appointment,
  )
  initialExamination: InitialExamination;
}
