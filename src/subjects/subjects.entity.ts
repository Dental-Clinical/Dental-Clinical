import { StudyYear } from '../study-years/study-years.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';

@Entity('subjects')
@Unique(['studyYear', 'name'])
export class Subject {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToOne(() => Clinic, (clinic) => clinic.subjects, { nullable: false })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic

  @ManyToOne(() => StudyYear)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear

  @OneToMany(
    () => SubjectProcedures,
    procedure => procedure.subject,
  )
  subjectProcedures: SubjectProcedures[]

  @OneToMany(
    () => SectionSubject,
    sectionSubject => sectionSubject.subject,
  )
  sectionSubjects: SectionSubject[]

  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.subject)
  clinicalCases: ClinicalCase[]

}
