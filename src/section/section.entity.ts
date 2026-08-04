import { Clinic } from "src/clinic/clinic.entity";
import { SectionSubject } from "src/section-subject/section-subject.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToOne(() => Clinic, clinic => clinic.sections)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic

  @OneToMany(
    () => SectionSubject,
    ss => ss.section
  )
  sectionSubjects: SectionSubject[]
}
