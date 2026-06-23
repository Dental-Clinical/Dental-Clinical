import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.patient, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user?: User;

  @Column()
  full_name: string;

  @Column()
  phone: string;

  @Column({
    default: false,
  })
  is_walkin: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  medical_history: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  allergies: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  current_medications: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
