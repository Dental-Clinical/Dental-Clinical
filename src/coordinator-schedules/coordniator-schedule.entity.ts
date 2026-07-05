import { DayOfWeek } from '../constants/day-of-week';
import { Coordinator } from '../coordinators/coordinator.entity';
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

@Entity('coordinator_schedules')
@Unique(['coordinator', 'day_of_week'])
export class CoordinatorSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coordinator, (coordinator) => coordinator.schedules, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator;

  @RelationId((schedule: CoordinatorSchedule) => schedule.coordinator)
  coordinator_id: number;

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

  // Duration in minutes
  @Column({
    type: 'int',
  })
  slot_duration: number;

  @Column({
    default: true,
  })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
