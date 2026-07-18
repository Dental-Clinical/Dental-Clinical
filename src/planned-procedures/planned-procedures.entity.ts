import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionProcedure } from 'src/sesssion-procedures/session-procedures.entity';

@Entity('planned_procedures')
export class PlannedProcedures {
  @ApiProperty({ description: 'Planned procedure ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => SubjectProcedures,
    description: 'Associated subject procedure',
  })
  @ManyToOne(
    () => SubjectProcedures,
    (subjectProcedure) => subjectProcedure.plannedProcedures,
  )
  @JoinColumn({ name: 'subject_procedure_id' })
  subjectProcedure: SubjectProcedures;

  @ApiProperty({
    type: () => DiagnosisSubmission,
    description: 'Associated diagnosis submission',
  })
  @ManyToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.plannedProcedures,
  )
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @OneToMany(
    () => SessionProcedure,
    (sessionProcedure) => sessionProcedure.plannedProcedure,
  )
  sessionProcedures: SessionProcedure[];

  @ApiProperty({ description: 'Tooth number', example: 36 })
  @Column({ type: 'int', name: 'tooth_number' })
  toothNumber: number;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Column({
    type: 'timestamp',
    name: 'completed_at',
    nullable: true,
  })
  completedAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
