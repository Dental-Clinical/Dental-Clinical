import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SubjectDiagnosisQuestion } from './subject-diagnosis-questions.entity';

@Entity('subject_diagnosis_answers')
export class SubjectDiagnosisAnswers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DiagnosisSubmission, (submission) => submission.answers)
  diagnosisSubmission: DiagnosisSubmission;

  @ManyToOne(() => SubjectDiagnosisQuestion)
  question: SubjectDiagnosisQuestion;

  @Column('text')
  answer: string;
}
