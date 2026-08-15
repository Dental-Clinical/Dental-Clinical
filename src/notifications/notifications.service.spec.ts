import { Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { UpdateResult } from 'typeorm';
import { FcmTokensService } from '../fcm-tokens/fcm-tokens.service';
import { FCMChannels } from '../fcm-tokens/enums/notification-channels.enum';
import type { PushPayload } from '../fcm-tokens/interfaces/push-payload.interface';
import { Notification } from './notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsService } from './notifications.service';

const payload: PushPayload = {
  title: 'Appointment confirmed',
  body: 'Sunday at 10:00.',
  data: { appointmentId: '42' },
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifications: {
    create: jest.Mock;
    save: jest.Mock;
    countBy: jest.Mock<Promise<number>, [unknown]>;
    existsBy: jest.Mock<Promise<boolean>, [unknown]>;
    update: jest.Mock<Promise<UpdateResult>, [unknown, unknown]>;
    createQueryBuilder: jest.Mock;
  };
  let fcm: {
    sendToUser: jest.Mock<
      Promise<{ sent: number; failed: number }>,
      [number, PushPayload, FCMChannels]
    >;
  };

  const sentPayload = (): PushPayload => fcm.sendToUser.mock.calls[0][1];

  beforeEach(async () => {
    notifications = {
      create: jest.fn((dto: Partial<Notification>) => dto),
      save: jest.fn((dto: Partial<Notification>) =>
        Promise.resolve({ id: 'n1', ...dto } as Notification),
      ),
      countBy: jest.fn<Promise<number>, [unknown]>().mockResolvedValue(0),
      existsBy: jest.fn<Promise<boolean>, [unknown]>().mockResolvedValue(true),
      update: jest
        .fn<Promise<UpdateResult>, [unknown, unknown]>()
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
      createQueryBuilder: jest.fn(),
    };
    fcm = {
      sendToUser: jest
        .fn<
          Promise<{ sent: number; failed: number }>,
          [number, PushPayload, FCMChannels]
        >()
        .mockResolvedValue({ sent: 1, failed: 0 }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notifications },
        { provide: FcmTokensService, useValue: fcm },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('notifyUser', () => {
    it('records the notification before pushing it', async () => {
      const order: string[] = [];
      notifications.save.mockImplementation(() => {
        order.push('save');
        return Promise.resolve({ id: 'n1' } as Notification);
      });
      fcm.sendToUser.mockImplementation(() => {
        order.push('push');
        return Promise.resolve({ sent: 1, failed: 0 });
      });

      await service.notifyUser(
        7,
        payload,
        NotificationType.APPOINTMENT,
        FCMChannels.APPOINTMENTS,
      );

      expect(order).toEqual(['save', 'push']);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 7,
          type: NotificationType.APPOINTMENT,
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }),
      );
    });

    it('sets the badge from the unread count rather than the caller', async () => {
      notifications.countBy.mockResolvedValue(4);

      await service.notifyUser(
        7,
        { ...payload, badge: 99 },
        NotificationType.APPOINTMENT,
        FCMChannels.APPOINTMENTS,
      );

      expect(sentPayload().badge).toBe(4);
    });

    it('passes the saved row id through so a tap can mark it read', async () => {
      await service.notifyUser(
        7,
        payload,
        NotificationType.APPOINTMENT,
        FCMChannels.APPOINTMENTS,
      );

      expect(sentPayload().data).toEqual({
        appointmentId: '42',
        notificationId: 'n1',
        type: NotificationType.APPOINTMENT,
      });
    });

    it('keeps the notification when the push throws', async () => {
      fcm.sendToUser.mockRejectedValue(new Error('firebase down'));

      await expect(
        service.notifyUser(
          7,
          payload,
          NotificationType.APPOINTMENT,
          FCMChannels.APPOINTMENTS,
        ),
      ).resolves.toEqual(expect.objectContaining({ id: 'n1' }));
      expect(notifications.save).toHaveBeenCalled();
    });
  });

  describe('notifyUsers', () => {
    it('creates one row per recipient', async () => {
      const created = await service.notifyUsers(
        [1, 2, 3],
        payload,
        NotificationType.APPOINTMENT,
        FCMChannels.APPOINTMENTS,
      );

      expect(created).toHaveLength(3);
      expect(fcm.sendToUser.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);
    });
  });

  describe('markAsRead', () => {
    it('scopes the update to the caller so it cannot read a foreign row', async () => {
      await service.markAsRead(7, 'n1');

      expect(notifications.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'n1', userId: 7 }),
        expect.objectContaining({ isRead: true }),
      );
    });

    it('throws when the row is not the callers', async () => {
      notifications.update.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [],
      });
      notifications.existsBy.mockResolvedValue(false);

      await expect(service.markAsRead(7, 'other')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('is idempotent for an already-read row', async () => {
      notifications.update.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [],
      });
      notifications.existsBy.mockResolvedValue(true);

      await expect(service.markAsRead(7, 'n1')).resolves.toEqual({
        message: 'Notification marked as read',
      });
    });
  });

  describe('markAllAsRead', () => {
    it('reports how many rows changed', async () => {
      notifications.update.mockResolvedValue({
        affected: 5,
        raw: [],
        generatedMaps: [],
      });

      await expect(service.markAllAsRead(7)).resolves.toEqual({
        message: 'All notifications marked as read',
        updated: 5,
      });
    });
  });
});
