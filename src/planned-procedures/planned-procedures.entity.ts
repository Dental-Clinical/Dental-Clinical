import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('planned_procedures')
export class PlannedProcedures {
  @ApiProperty({ description: 'Planned procedure ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => SubjectProcedures, description: 'Associated subject procedure' })
  @ManyToOne(
    () => SubjectProcedures,
    (subjectProcedure) => subjectProcedure.plannedProcedures,
  )
  @JoinColumn({ name: 'subject_procedure_id' })
  subjectProcedure: SubjectProcedures;

  @ApiProperty({ type: () => DiagnosisSubmission, description: 'Associated diagnosis submission' })
  @ManyToOne(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.plannedProcedures,
  )
  @JoinColumn({ name: 'diagnosis_submission_id' })
  diagnosisSubmission: DiagnosisSubmission;

  @ApiProperty({ description: 'Tooth number', example: 36 })
  @Column({ type: 'int', name: 'tooth_number' })
  toothNumber: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
