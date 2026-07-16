import { Supervisor } from '../supervisors/supervisor.entity';
import { Subject } from '../subjects/subjects.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentSection } from 'src/student-section/student-section.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'clinic_sections' })
export class ClinicSections {
  @ApiProperty({ description: 'Clinic section ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Subject, description: 'Associated subject' })
  @ManyToOne(() => Subject, (subject) => subject.clinicSections)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ApiProperty({ type: () => Supervisor, description: 'Assigned supervisor' })
  @ManyToOne(() => Supervisor, (supervisor) => supervisor.clinicSections)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @ApiPropertyOptional({ type: () => [StudentSection], description: 'Student section enrollments' })
  @OneToMany(
    () => StudentSection,
    (studentSection) => studentSection.clinicSection,
  )
  studentSections: StudentSection[];

  @ApiProperty({ description: 'Section name', example: 'Section A' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({ description: 'Whether the section is active', example: true })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
