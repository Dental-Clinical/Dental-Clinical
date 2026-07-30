import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { Student } from 'src/students/student.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clinical_case_evaluations')
@Check('"grade" >= 0 AND "grade" <= 100')
export class ClinicalCaseEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ClinicalCase, (clinicalCase) => clinicalCase.evaluation, {
    nullable: false,
  })
  @JoinColumn({ name: 'clinical_case_id' })
  clinicalCase: ClinicalCase;

  @ManyToOne(() => Student, (student) => student.clinicalCaseEvaluations, {
    nullable: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(
    () => Supervisor,
    (supervisor) => supervisor.clinicalCaseEvaluations,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @Column({
    type: 'int',
    nullable: false,
  })
  grade: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
