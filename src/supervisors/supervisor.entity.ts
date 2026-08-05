import { SupervisorSchedule } from 'src/supervisor-schedules/supervisor-schedules.entity';
import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupervisorReview } from 'src/supervisor-reviews/supervisor-reviews.entity';
import { ClinicalCaseEvaluation } from 'src/clinical-case-evaluation/clinical-case-evaluation.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';

@Entity('supervisors')
export class Supervisor {
  @ApiProperty({ description: 'Supervisor ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'Associated user account' })
  @OneToOne(() => User, (user) => user.supervisor, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'Record creation timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiPropertyOptional({
    type: () => [SupervisorSchedule],
    description: 'Supervisor schedules',
  })
  @OneToMany(() => SupervisorSchedule, (schedule) => schedule.supervisor)
  schedules: SupervisorSchedule[];

  @ApiPropertyOptional({
    type: () => [ClinicalCase],
    description: 'Supervised clinical cases',
  })
  @OneToMany(
    () => ClinicalCase,
    (clinicalCase) => clinicalCase.assignedSupervisor,
  )
  clinicalCases: ClinicalCase[];

  @ApiPropertyOptional({
    type: () => [DiagnosisSubmission],
    description: 'Reviewed diagnosis submissions',
  })
  @OneToMany(
    () => DiagnosisSubmission,
    (diagnosisSubmission) => diagnosisSubmission.supervisor,
  )
  diagnosisSubmissions: DiagnosisSubmission[];

  @ApiPropertyOptional({
    type: () => [SupervisorReview],
    description: 'Supervisor reviews',
  })
  @OneToMany(
    () => SupervisorReview,
    (supervisorReview) => supervisorReview.supervisor,
  )
  supervisorReviews: SupervisorReview[];

  @ApiPropertyOptional({
    type: () => [ClinicalCaseEvaluation],
    description: 'Clinical case evaluations',
  })
  @OneToMany(
    () => ClinicalCaseEvaluation,
    (evaluation) => evaluation.supervisor,
  )
  clinicalCaseEvaluations: ClinicalCaseEvaluation[];

  @OneToMany(() => SectionSubject, (ss) => ss.supervisor)
  sectionSubjects: SectionSubject[];
}
