import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubjectDiagnosisQuestion } from './subject-diagnosis-questions.entity';

@Entity('subject_diagnosis_question_options')
export class SubjectDiagnosisQuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => SubjectDiagnosisQuestion,
    (question) => question.answerOptions,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'question_id' })
  question: SubjectDiagnosisQuestion;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 100 })
  value: string;

  @Column()
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;
}
