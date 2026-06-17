import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('coordinators')
export class Coordinator {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.coordinator)
  @JoinColumn()
  user: User;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
