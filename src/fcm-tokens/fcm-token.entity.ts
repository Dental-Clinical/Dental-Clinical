import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { DevicePlatform } from './enums/device-platform.enum';

@Entity('device_tokens')
@Unique(['token'])
export class DeviceToken {
  @ApiProperty({
    description: 'Device token ID',
    example: '3f1a7c2e-4b8d-4a91-9c5e-7d2f0b6a1e84',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'FCM registration token' })
  @Column({ type: 'text' })
  token: string;

  @ApiProperty({ description: 'Device platform', enum: DevicePlatform })
  @Column({ type: 'enum', enum: DevicePlatform })
  platform: DevicePlatform;

  @ApiProperty({ description: 'Owner user ID', example: 1 })
  @Index()
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ApiProperty({ type: () => User, description: 'Owner of the device' })
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Last time the token was registered or refreshed',
  })
  @Column({ type: 'timestamptz', default: () => 'now()' })
  lastSeenAt: Date;
}
