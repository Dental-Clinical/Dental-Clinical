import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Section } from 'src/section/section.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('clinics')
@Unique(['name', 'academicYear'])
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => AcademicYear, (year) => year.clinics)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @OneToMany(() => Subject, (subject) => subject.clinic)
  subjects: Subject[];

  @OneToMany(() => Section, (section) => section.clinic)
  sections: Section[];
}
