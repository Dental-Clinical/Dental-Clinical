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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  full_name: string;

  @ApiProperty({ description: 'Father name', example: 'Ahmad' })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  father_name: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+963912345678' })
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john@example.com' })
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email: string;

  @ApiPropertyOptional({ description: 'Password hash' })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  password_hash: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'patient', 'supervisor', 'student', 'coordinator'], example: 'student' })
  @Column({
    type: 'enum',
    enum: ['admin', 'patient', 'supervisor', 'student', 'coordinator'],
  })
  role: string;

  @ApiPropertyOptional({ description: 'Profile image path' })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  profile_image: string;

  @ApiProperty({ description: 'Whether the user is active', example: true })
  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiPropertyOptional({ type: () => Student, description: 'Associated student profile' })
  @OneToOne(() => Student, (student) => student.user)
  student?: Student;

  @ApiPropertyOptional({ type: () => Supervisor, description: 'Associated supervisor profile' })
  @OneToOne(() => Supervisor, (supervisor) => supervisor.user)
  supervisor?: Supervisor;

  @ApiPropertyOptional({ type: () => Coordinator, description: 'Associated coordinator profile' })
  @OneToOne(() => Coordinator, (coordinator) => coordinator.user)
  coordinator?: Coordinator;

  @ApiPropertyOptional({ type: () => Patient, description: 'Associated patient profile' })
  @OneToOne(() => Patient, (patient) => patient.user)
  patient?: Patient;

  @ApiPropertyOptional({ type: () => [Session], description: 'User sessions' })
  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
