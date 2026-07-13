import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('planned_procedures')
export class PlannedProcedures {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => SubjectProcedures,
    (subjectProcedure) => subjectProcedure.plannedProcedures,
  )
  @JoinColumn({ name: 'subject_procedure_id' })
  subjectProcedure: SubjectProcedures;

  @ManyToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.plannedProcedures,
  )
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @Column({ type: 'varchar', name: 'tooth_number' })
  toothNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
