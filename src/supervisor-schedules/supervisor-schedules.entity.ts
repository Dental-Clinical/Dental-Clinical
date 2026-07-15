import { DayOfWeek } from 'src/constants/day-of-week';
import { Supervisor } from '../supervisors/supervisor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('supervisor_schedules')
@Unique(['supervisor', 'day_of_week'])
export class SupervisorSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.schedules, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor;

  @RelationId((schedule: SupervisorSchedule) => schedule.supervisor)
  supervisor_id: number;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  day_of_week: string;

  @Column({
    type: 'time',
  })
  start_time: string;

  @Column({
    type: 'time',
  })
  end_time: string;

  @Column({
    default: true,
  })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
