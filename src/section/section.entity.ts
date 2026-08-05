import { Clinic } from 'src/clinic/clinic.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.sections)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @OneToMany(() => SectionSubject, (ss) => ss.section)
  sectionSubjects: SectionSubject[];

  @OneToMany(() => StudentSubjectEnrollment, (enrollment) => enrollment.section)
  enrollments: StudentSubjectEnrollment[];
}
