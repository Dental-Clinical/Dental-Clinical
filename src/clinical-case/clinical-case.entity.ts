import { InitialExamination } from '../initial-examination/initial-examination.entity';
import { ExaminationRequest } from '../examination-requests/entities/examination-request.entity';
import { Patient } from '../patients/patient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subject } from '../subjects/subjects.entity';
import { Student } from '../students/student.entity';
import { ClinicalCaseStatus } from './enums/clinical-case-status.enum';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';

@Entity('clinical_cases')
export class ClinicalCase {
  @ApiProperty({ description: 'Clinical case ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Patient, description: 'Associated patient' })
  @ManyToOne(() => Patient, (patient) => patient.clinical_cases, {
    nullable: false,
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty({
    type: () => ExaminationRequest,
    description: 'Associated examination request',
  })
  @OneToOne(() => ExaminationRequest, (request) => request.clinicalCase, {
    nullable: false,
  })
  @JoinColumn({ name: 'request_id' })
  request: ExaminationRequest;

  @ApiProperty({
    type: () => InitialExamination,
    description: 'Associated initial examination',
  })
  @OneToOne(
    () => InitialExamination,
    (examination) => examination.clinicalCase,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'initial_examination_id' })
  initialExamination: InitialExamination;

  @ApiProperty({ type: () => Subject, description: 'Associated subject' })
  @ManyToOne(() => Subject, (subject) => subject.clinicalCases, {
    nullable: false,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ApiPropertyOptional({ type: () => Student, description: 'Assigned student' })
  @ManyToOne(() => Student, (student) => student.clinicalCases, {
    nullable: true,
  })
  @JoinColumn({ name: 'assigned_student_id' })
  assignedStudent: Student;

  @ApiPropertyOptional({
    type: () => Supervisor,
    description: 'Assigned supervisor',
  })
  @ManyToOne(() => Supervisor, (supervisor) => supervisor.clinicalCases, {
    nullable: true,
  })
  @JoinColumn({ name: 'assigned_supervisor_id' })
  assignedSupervisor: Supervisor;

  @ApiPropertyOptional({
    type: () => DiagnosisSubmission,
    description: 'Diagnosis submission',
  })
  @OneToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.clinicalCase,
  )
  diagnosisSubmission: DiagnosisSubmission;

  @OneToMany(
    () => TreatmentSession,
    (treatmentSession) => treatmentSession.clinicalCase,
  )
  treatmentSessions: TreatmentSession[];

  @OneToMany(
    () => ClinicalAppointment,
    (clinicalAppointment) => clinicalAppointment.clinicalCase,
  )
  clinicalAppointments: ClinicalAppointment[];

  @ApiProperty({
    description: 'Case status',
    enum: ClinicalCaseStatus,
    example: ClinicalCaseStatus.OPEN,
  })
  @Column({
    type: 'enum',
    enum: ClinicalCaseStatus,
    default: ClinicalCaseStatus.OPEN,
  })
  status: ClinicalCaseStatus;

  @ApiPropertyOptional({ description: 'Case closure timestamp' })
  @Column({
    name: 'closed_at',
    type: 'timestamp',
    nullable: true,
  })
  closedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
