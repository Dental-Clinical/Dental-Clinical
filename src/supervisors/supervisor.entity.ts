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

@Entity('supervisors')
export class Supervisor {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.supervisor, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
  @OneToMany(() => SupervisorSchedule, (schedule) => schedule.supervisor)
  schedules: SupervisorSchedule[];
}
