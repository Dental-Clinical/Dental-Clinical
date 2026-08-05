import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { Section } from 'src/section/section.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('section_subjects')
@Unique(['section', 'subject', 'academicYear'])
export class SectionSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Section, (section) => section.sectionSubjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ManyToOne(() => Subject, (subject) => subject.sectionSubjects, {
    nullable: false,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.sectionSubjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @ManyToOne(() => AcademicYear, { nullable: false })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;
}
