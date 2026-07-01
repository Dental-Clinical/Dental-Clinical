import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  jti: string;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  device_info: string;
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expires_at: Date;
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
