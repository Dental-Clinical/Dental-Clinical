import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { NotificationType } from './enums/notification-type.enum';

// Every query is scoped to one user and then either filters on read state
// (inbox tabs, unread badge) or orders by recency (the list itself).
@Index(['userId', 'isRead'])
@Index(['userId', 'createdAt'])
@Entity('notifications')
export class Notification {
  @ApiProperty({
    description: 'Notification ID',
    example: '3f1a7c2e-4b8d-4a91-9c5e-7d2f0b6a1e84',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Recipient user ID', example: 1 })
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ApiProperty({
    type: () => User,
    description: 'Recipient of the notification',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Client-facing category, used for the icon and tap target',
    enum: NotificationType,
  })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Appointment confirmed',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'Your appointment on Sunday at 10:00 has been confirmed.',
  })
  @Column({ type: 'text' })
  body: string;

  @ApiPropertyOptional({
    description:
      'The same data block sent to FCM, so a tap can deep-link from the ' +
      'inbox exactly as it does from the push banner',
    example: { type: 'appointment', appointmentId: '42' },
  })
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, string> | null;

  @ApiProperty({
    description: 'Whether the recipient has read it',
    example: false,
  })
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'When the recipient read it' })
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @ApiProperty({ description: 'When the notification was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
