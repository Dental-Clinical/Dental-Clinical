import { Student } from '../students/student.entity';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Supervisor } from '../supervisors/supervisor.entity';
import { ClinicalAppointmentStatus } from './enums/clinical-appointment.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('clinical_appointments')
export class ClinicalAppointment {
  @ApiProperty({ description: 'Clinical appointment ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => ClinicalCase, description: 'Associated clinical case' })
  @ManyToOne(() => ClinicalCase)
  clinicalCase: ClinicalCase;

  @ApiProperty({ type: () => Student, description: 'Assigned student' })
  @ManyToOne(() => Student)
  student: Student;

  @ApiProperty({ type: () => Patient, description: 'Associated patient' })
  @ManyToOne(() => Patient)
  patient: Patient;

  @ApiProperty({ type: () => Supervisor, description: 'Assigned supervisor' })
  @ManyToOne(() => Supervisor)
  supervisor: Supervisor;

  @ApiProperty({ description: 'Appointment date', example: '2025-01-15' })
  @Column({ type: 'date' })
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment start time', example: '09:00' })
  @Column({ type: 'time' })
  appointmentStart: string;

  @ApiProperty({ description: 'Appointment end time', example: '10:00' })
  @Column({ type: 'time' })
  appointmentEnd: string;

  @ApiProperty({ description: 'Appointment status', enum: ClinicalAppointmentStatus, example: ClinicalAppointmentStatus.SCHEDULED })
  @Column({
    type: 'enum',
    enum: ClinicalAppointmentStatus,
  })
  status: ClinicalAppointmentStatus;
}
