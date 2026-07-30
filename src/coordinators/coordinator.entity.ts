import { InitialExamination } from '../initial-examination/initial-examination.entity';
import { CoordinatorSchedule } from '../coordinator-schedules/coordniator-schedule.entity';
import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('coordinators')
export class Coordinator {
  @ApiProperty({ description: 'Coordinator ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'Associated user account' })
  @OneToOne(() => User, (user) => user.coordinator, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'Record creation timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiPropertyOptional({
    type: () => [CoordinatorSchedule],
    description: 'Coordinator schedules',
  })
  @OneToMany(() => CoordinatorSchedule, (schedule) => schedule.coordinator)
  schedules: CoordinatorSchedule[];

  @ApiPropertyOptional({
    type: () => [InitialExamination],
    description: 'Conducted initial examinations',
  })
  @OneToMany(() => InitialExamination, (examination) => examination.coordinator)
  initialExaminations: InitialExamination[];
}
