import { AcademicYear } from "src/academic-years/academic-years.entity";
import { Subject } from "src/subjects/subjects.entity";
import { Section } from "src/section/section.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({ nullable: true })
  description?: string

  @ManyToOne(() => AcademicYear, (year) => year.clinics)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear

  @OneToMany(() => Subject, (subject) => subject.clinic)
  subjects: Subject[]

  @OneToMany(() => Section, (section) => section.clinic)
  sections: Section[]


}

