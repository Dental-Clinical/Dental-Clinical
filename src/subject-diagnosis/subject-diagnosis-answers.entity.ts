import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SubjectDiagnosisQuestion } from './subject-diagnosis-questions.entity';
import { SubjectDiagnosisQuestionOption } from './subject-diagnosis-answer-option.entity';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';

// @Entity('subject_diagnosis_answers')
// export class SubjectDiagnosisAnswers {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => DiagnosisSubmission, (submission) => submission.answers)
//   diagnosisSubmission: DiagnosisSubmission;

//   @ManyToOne(() => SubjectDiagnosisQuestion)
//   question: SubjectDiagnosisQuestion;

//   @Column('text')
//   answer: string;
// }
@Entity('subject_diagnosis_answers')
@Unique(['plannedProcedure', 'question'])
export class SubjectDiagnosisAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DiagnosisSubmission, (submission) => submission.answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @ManyToOne(() => SubjectDiagnosisQuestion, (question) => question.answers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'question_id' })
  question: SubjectDiagnosisQuestion;

  @Column({ type: 'text', nullable: true })
  answer: string | null;

  @ManyToMany(() => SubjectDiagnosisQuestionOption)
  @JoinTable({
    name: 'subject_diagnosis_answer_selected_options',
    joinColumn: {
      name: 'answer_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'option_id',
      referencedColumnName: 'id',
    },
  })
  selectedOptions: SubjectDiagnosisQuestionOption[];

  @ManyToOne(() => PlannedProcedures)
  @JoinColumn({ name: 'planned_procedure_id' })
  plannedProcedure: PlannedProcedures;
}
