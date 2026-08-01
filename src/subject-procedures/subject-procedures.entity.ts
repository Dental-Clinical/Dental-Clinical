import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { StudentProgress } from 'src/student-progress/student-progress.entity';
import { Subject } from 'src/subjects/subjects.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('subject_procedures')
@Unique(['subject', 'name'])
export class SubjectProcedures {
  @ApiProperty({ description: 'Subject procedure ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Subject, description: 'Associated subject' })
  @ManyToOne(() => Subject, (subject) => subject.subjectProcedures)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ApiProperty({ description: 'Subject ID', example: 1 })
  @RelationId('subject')
  subject_id: number;

  @ApiPropertyOptional({
    type: () => [PlannedProcedures],
    description: 'Planned procedures using this subject procedure',
  })
  @OneToMany(
    () => PlannedProcedures,
    (plannedProcedure) => plannedProcedure.subjectProcedure,
  )
  plannedProcedures: PlannedProcedures[];

  @ApiPropertyOptional({
    type: () => [StudentProgress],
    description: 'Per-student progress on this subject procedure',
  })
  @OneToMany(
    () => StudentProgress,
    (studentProgress) => studentProgress.subjectProcedure,
  )
  studentProgress: StudentProgress[];

  @ApiProperty({ description: 'Procedure name', example: 'Composite Filling' })
  @Column({
    type: 'varchar',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Procedure description',
    example: 'Direct composite restoration',
  })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @ApiProperty({ description: 'Required count', example: 3 })
  @Column({
    type: 'int',
  })
  required_count: number;

  @ApiProperty({
    description: 'Whether the procedure is active',
    example: true,
  })
  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
