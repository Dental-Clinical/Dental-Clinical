import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('sessions')
export class Session {
  @ApiProperty({ description: 'Session ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'JWT token ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  jti: string;

  @ApiProperty({ description: 'Device information', example: 'Chrome 120.0 on Windows 10' })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  device_info: string;

  @ApiProperty({ description: 'Token expiration timestamp' })
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expires_at: Date;

  @ApiProperty({ description: 'Session creation timestamp' })
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
