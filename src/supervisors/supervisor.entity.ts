import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('supervisors')
export class Supervisor {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.supervisor)
  @JoinColumn()
  user: User;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
