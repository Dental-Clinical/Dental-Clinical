import { Supervisor } from '../supervisors/supervisor.entity';
import { Subject } from '../subjects/subjects.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentSection } from 'src/student-section/student-section.entity';

@Entity({ name: 'clinic_sections' })
export class ClinicSections {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subject, (subject) => subject.clinicSections)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.clinicSections)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @OneToMany(
    () => StudentSection,
    (studentSection) => studentSection.clinicSection,
  )
  studentSections: StudentSection[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
