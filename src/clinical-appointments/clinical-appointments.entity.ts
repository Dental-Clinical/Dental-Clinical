import { Student } from '../students/student.entity';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Supervisor } from '../supervisors/supervisor.entity';
import { ClinicalAppointmentStatus } from './enums/clinical-appointment.enum';

@Entity('clinical_appointments')
export class ClinicalAppointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClinicalCase)
  clinicalCase: ClinicalCase;

  @ManyToOne(() => Student)
  student: Student;

  @ManyToOne(() => Patient)
  patient: Patient;

  @ManyToOne(() => Supervisor)
  supervisor: Supervisor;

  @Column({ type: 'date' })
  appointmentDate: Date;

  @Column({ type: 'time' })
  appointmentStart: string;

  @Column({ type: 'time' })
  appointmentEnd: string;

  @Column({
    type: 'enum',
    enum: ClinicalAppointmentStatus,
  })
  status: ClinicalAppointmentStatus;
}
