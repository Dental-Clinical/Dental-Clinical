import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { Subject } from 'src/subjects/subjects.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subject_procedures')
@Unique(['subject', 'name'])
export class SubjectProcedures {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subject, (subject) => subject.subjectProcedures)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToMany(
    () => PlannedProcedures,
    (plannedProcedure) => plannedProcedure.subjectProcedure,
  )
  plannedProcedures: PlannedProcedures[];

  @Column({
    type: 'varchar',
  })
  name: string;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;
  @Column({
    type: 'int',
  })
  required_count: number;
  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
