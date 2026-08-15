import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FcmTokensService } from '../fcm-tokens/fcm-tokens.service';
import { FCMChannels } from '../fcm-tokens/enums/notification-channels.enum';
import { PushPayload } from '../fcm-tokens/interfaces/push-payload.interface';
import { Student } from '../students/student.entity';
import { Notification } from './notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
    private readonly fcmTokensService: FcmTokensService,
  ) {}

  /**
   * The single write path: a notification is recorded first, then pushed, so
   * nothing can reach a device without existing in the user's inbox.
   */
  async notifyUser(
    userId: number,
    payload: PushPayload,
    type: NotificationType,
    channel: FCMChannels,
  ): Promise<Notification> {
    const notification = await this.notifications.save(
      this.notifications.create({
        userId,
        type,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? null,
      }),
    );

    const unreadCount = await this.notifications.countBy({
      userId,
      isRead: false,
    });

    // The push is a side effect of the record, never the other way round: a
    // delivery failure must not lose the notification the user can still open
    // the app to read.
    try {
      await this.fcmTokensService.sendToUser(
        userId,
        {
          ...payload,
          // Derived rather than caller-supplied, so the badge always matches
          // what the inbox actually shows.
          badge: unreadCount,
          data: {
            ...payload.data,
            notificationId: notification.id,
            type,
          },
        },
        channel,
      );
    } catch (error) {
      this.logger.error(
        `Saved notification ${notification.id} but failed to push it to user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return notification;
  }

  async notifyUsers(
    userIds: number[],
    payload: PushPayload,
    type: NotificationType,
    channel: FCMChannels,
  ): Promise<Notification[]> {
    const created: Notification[] = [];
    for (const userId of userIds) {
      created.push(await this.notifyUser(userId, payload, type, channel));
    }
    return created;
  }

  /**
   * Fans a test notification out to every active student. Driven off the
   * `students` table rather than `users.role`, so the domain definition of a
   * student stays the source of truth.
   */
  async notifyAllStudents() {
    const rows = await this.students
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('user.is_active = :active', { active: true })
      .select('user.id', 'userId')
      .getRawMany<{ userId: number }>();

    const userIds = rows.map((row) => row.userId);

    if (!userIds.length) {
      return { message: 'No active students to notify', students: 0 };
    }

    await this.notifyUsers(
      userIds,
      {
        title: 'Test notification',
        body: 'Push delivery to students is working.',
      },
      NotificationType.TEST,
      FCMChannels.APPOINTMENTS,
    );

    return {
      message: 'Test notification sent to students',
      students: userIds.length,
    };
  }

  async getNotifications(userId: number, dto: GetNotificationsQueryDto) {
    const qb = this.notifications
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (dto.isRead !== undefined) {
      qb.andWhere('notification.isRead = :isRead', { isRead: dto.isRead });
    }

    if (dto.type) {
      qb.andWhere('notification.type = :type', { type: dto.type });
    }

    qb.orderBy('notification.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [notifications, total] = await qb.getManyAndCount();

    // Always the whole inbox, never the filtered page, so the badge stays
    // correct while the client is looking at a filtered tab.
    const unreadCount = await this.notifications.countBy({
      userId,
      isRead: false,
    });

    return {
      message: 'Notifications retrieved successfully',
      notifications: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        isRead: notification.isRead,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      })),
      unreadCount,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async markAsRead(userId: number, id: string) {
    // Scoping the update by userId is what stops one user marking another
    // user's notification read.
    const result = await this.notifications.update(
      { id, userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    if (!result.affected) {
      // Nothing changed either because the row is not the caller's or because
      // it was already read; only the former is an error.
      const exists = await this.notifications.existsBy({ id, userId });
      if (!exists) {
        throw new NotFoundException('Notification not found');
      }
    }

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: number) {
    const result = await this.notifications.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      message: 'All notifications marked as read',
      updated: result.affected ?? 0,
    };
  }
}
