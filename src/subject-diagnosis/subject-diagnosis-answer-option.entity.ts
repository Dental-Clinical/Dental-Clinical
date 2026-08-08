import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubjectDiagnosisQuestion } from './subject-diagnosis-questions.entity';

@Entity('subject_diagnosis_answer_options')
export class SubjectDiagnosisAnswerOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => SubjectDiagnosisQuestion,
    (question) => question.answerOptions,
  )
  @JoinColumn({ name: 'question_id' })
  question: SubjectDiagnosisQuestion;

  @Column()
  label: string;
  @Column()
  value: string;
  @Column()
  displayOrder: number;
}
