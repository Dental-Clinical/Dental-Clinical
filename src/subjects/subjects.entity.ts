import { InitialExamination } from '../initial-examination/initial-examination.entity';
import { StudyYear } from '../study-years/study-years.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';

@Entity('subjects')
@Unique(['studyYear', 'name'])
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudyYear, (studyYear) => studyYear.subjects)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear;

  @RelationId('studyYear')
  study_year_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'int', nullable: false })
  required_cases: number;
  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @OneToMany(() => InitialExamination, (examination) => examination.subject)
  initialExaminations: InitialExamination[];
  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.subject)
  clinicalCases: ClinicalCase[];
}
