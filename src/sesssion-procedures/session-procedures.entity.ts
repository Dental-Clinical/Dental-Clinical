import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('session_procedures')
export class SessionProcedure {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TreatmentSession,
    (treatmentSession) => treatmentSession.sessionProcedures,
  )
  @JoinColumn({ name: 'treatment_session_id' })
  treatmentSession: TreatmentSession;

  @ManyToOne(
    () => PlannedProcedures,
    (plannedProcedure) => plannedProcedure.sessionProcedures,
  )
  @JoinColumn({ name: 'planned_procedure_id' })
  plannedProcedure: PlannedProcedures;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
