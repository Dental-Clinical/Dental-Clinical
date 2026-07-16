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
import { ApiProperty } from '@nestjs/swagger';

@Entity('coordinator_schedules')
@Unique(['coordinator', 'day_of_week'])
export class CoordinatorSchedule {
  @ApiProperty({ description: 'Schedule ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => Coordinator,
    description: 'Associated coordinator',
  })
  @ManyToOne(() => Coordinator, (coordinator) => coordinator.schedules, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator;

  @ApiProperty({ description: 'Coordinator ID', example: 1 })
  @RelationId((schedule: CoordinatorSchedule) => schedule.coordinator)
  coordinator_id: number;

  @ApiProperty({
    description: 'Day of week',
    enum: DayOfWeek,
    example: DayOfWeek.SUNDAY,
  })
  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  day_of_week: string;

  @ApiProperty({ description: 'Start time', example: '09:00' })
  @Column({
    type: 'time',
  })
  start_time: string;

  @ApiProperty({ description: 'End time', example: '17:00' })
  @Column({
    type: 'time',
  })
  end_time: string;

  @ApiProperty({ description: 'Slot duration in minutes', example: 30 })
  @Column({
    type: 'int',
  })
  slot_duration: number;

  @ApiProperty({ description: 'Whether the schedule is active', example: true })
  @Column({
    default: true,
  })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
