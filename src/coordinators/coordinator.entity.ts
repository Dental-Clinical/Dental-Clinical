import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
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

@Entity('coordinators')
export class Coordinator {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.coordinator, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
  @OneToMany(() => CoordinatorSchedule, (schedule) => schedule.coordinator)
  schedules: CoordinatorSchedule[];
  @OneToMany(() => InitialExamination, (examination) => examination.coordinator)
  initialExaminations: InitialExamination[];
}
