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
import { PlannedProceduresStatus } from './enum/planned-procedures-status.enum';

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

  // todo Status instead of completedAt, to track the status of the procedure (planned, in progress, completed, etc.)
  @ApiProperty({
    description: 'Status of the planned procedure',
    example: PlannedProceduresStatus.PLANNED,
  })
  @Column({
    type: 'enum',
    enum: PlannedProceduresStatus,
    default: PlannedProceduresStatus.PLANNED,
  })
  status: PlannedProceduresStatus;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
