import { Coordinator } from '../coordinators/coordinator.entity';
import { Student } from '../students/student.entity';
import { Supervisor } from '../supervisors/supervisor.entity';
import { Session } from '../sessions/session.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  full_name: string;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  father_name: string;
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  phone: string;
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email: string;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  password_hash: string;
  @Column({
    type: 'enum',
    enum: ['admin', 'patient', 'supervisor', 'student', 'coordinator'],
  })
  role: string;
  @Column({
    type: 'varchar',
    nullable: true,
  })
  profile_image: string;
  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
  @OneToOne(() => Student, (student) => student.user)
  student?: Student;
  @OneToOne(() => Supervisor, (supervisor) => supervisor.user)
  supervisor?: Supervisor;
  @OneToOne(() => Coordinator, (coordinator) => coordinator.user)
  coordinator?: Coordinator;
  @OneToOne(() => Patient, (patient) => patient.user)
  patient?: Patient;
  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
