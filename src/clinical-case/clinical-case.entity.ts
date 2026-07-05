import { InitialExamination } from '../initial-examination/initial-examination.entity';
import { ExaminationRequest } from '../examination-requests/entities/examination-request.entity';
import { Patient } from '../patients/patient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subject } from '../subjects/subjects.entity';
import { Student } from '../students/student.entity';
import { ClinicalCaseStatus } from './enums/clinical-case-status.enum';

@Entity('clinical_cases')
export class ClinicalCase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.clinical_cases, {
    nullable: false,
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToOne(() => ExaminationRequest, (request) => request.clinicalCase, {
    nullable: false,
  })
  @JoinColumn({ name: 'request_id' })
  request: ExaminationRequest;

  @OneToOne(
    () => InitialExamination,
    (examination) => examination.clinicalCase,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'initial_examination_id' })
  initialExamination: InitialExamination;

  @ManyToOne(() => Subject, (subject) => subject.clinicalCases, {
    nullable: false,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Student, (student) => student.clinicalCases, {
    nullable: true,
  })
  @JoinColumn({ name: 'assigned_student_id' })
  assignedStudent: Student;

  @Column({
    type: 'enum',
    enum: ClinicalCaseStatus,
    default: ClinicalCaseStatus.OPEN,
  })
  status: ClinicalCaseStatus;

  @Column({
    name: 'closed_at',
    type: 'timestamp',
    nullable: true,
  })
  closedAt: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
