import { Subject } from 'src/subjects/subjects.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { QuestionType } from './enums/question-types.enum';
import { SubjectDiagnosisAnswer } from './subject-diagnosis-answers.entity';
import { SubjectDiagnosisQuestionOption } from './subject-diagnosis-answer-option.entity';

@Entity({ name: 'subject_diagnosis_questions' })
@Unique(['subject', 'question'])
export class SubjectDiagnosisQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subject, (subject) => subject.diagnosisQuestions)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column()
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ default: true })
  required: boolean;

  @Column()
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SubjectDiagnosisQuestionOption, (option) => option.question)
  answerOptions: SubjectDiagnosisQuestionOption[];

  @OneToMany(() => SubjectDiagnosisAnswer, (answer) => answer.question)
  answers: SubjectDiagnosisAnswer[];
}
