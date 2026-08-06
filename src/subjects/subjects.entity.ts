import { StudyYear } from '../study-years/study-years.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
} from 'typeorm';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { Material } from 'src/materials/materials.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';

@Entity('subjects')
@Unique(['studyYear', 'name'])
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'short_name', nullable: true })
  shortName: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => StudentSubjectEnrollment, (enrollment) => enrollment.subject)
  enrollments: StudentSubjectEnrollment[];

  @ManyToOne(() => Clinic, (clinic) => clinic.subjects, { nullable: false })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @ManyToOne(() => StudyYear)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear;

  /**
   * Populated at load and NOT refreshed when `studyYear` is reassigned, which
   * is what lets updateSubject tell whether the study year actually changed.
   */
  @RelationId('studyYear')
  study_year_id: number;

  @OneToMany(() => SubjectProcedures, (procedure) => procedure.subject)
  subjectProcedures: SubjectProcedures[];

  @OneToMany(() => SectionSubject, (sectionSubject) => sectionSubject.subject)
  sectionSubjects: SectionSubject[];

  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.subject)
  clinicalCases: ClinicalCase[];

  @ManyToMany(() => Material, (material) => material.subjects)
  @JoinTable({
    name: 'subject_materials',
    joinColumn: {
      name: 'subject_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'material_id',
      referencedColumnName: 'id',
    },
  })
  materials: Material[];
}
