import { User } from 'src/users/user.entity';
import { Column, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export class Session {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToMany(() => User, (user) => user.sessions)
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
