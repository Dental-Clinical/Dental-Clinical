import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../enums/notification-type.enum';

export class NotificationResponseDto {
  @ApiProperty({ example: '3f1a7c2e-4b8d-4a91-9c5e-7d2f0b6a1e84' })
  id: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.APPOINTMENT,
  })
  type: NotificationType;

  @ApiProperty({ example: 'Appointment confirmed' })
  title: string;

  @ApiProperty({
    example: 'Your appointment on Sunday at 10:00 has been confirmed.',
  })
  body: string;

  @ApiPropertyOptional({
    example: { type: 'appointment', appointmentId: '42' },
  })
  data: Record<string, string> | null;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiPropertyOptional({ example: '2026-08-15T10:00:00.000Z' })
  readAt: Date | null;

  @ApiProperty({ example: '2026-08-15T09:30:00.000Z' })
  createdAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class GetNotificationsResponseDto {
  @ApiProperty({ example: 'Notifications retrieved successfully' })
  message: string;

  @ApiProperty({ type: [NotificationResponseDto] })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: 'Unread count for the whole inbox, not just this page',
    example: 3,
  })
  unreadCount: number;

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class MarkReadResponseDto {
  @ApiProperty({ example: 'Notification marked as read' })
  message: string;
}

export class MarkAllReadResponseDto {
  @ApiProperty({ example: 'All notifications marked as read' })
  message: string;

  @ApiProperty({ description: 'How many rows changed', example: 3 })
  updated: number;
}
