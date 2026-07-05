import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinColumn } from 'typeorm/browser';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  university_id: string;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.assignedStudent)
  clinicalCases: ClinicalCase[];
}
