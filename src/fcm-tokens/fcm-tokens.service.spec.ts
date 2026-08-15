import { Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type {
  BatchResponse,
  MulticastMessage,
  SendResponse,
} from 'firebase-admin/messaging';
import type { DeleteResult, FindOperator, FindOptionsWhere } from 'typeorm';
import firebaseConfig from 'src/config/firebase.config';
import { FIREBASE_MESSAGING } from '../firebase/firebase.provider';
import { DevicePlatform } from './enums/device-platform.enum';
import { FCMChannels } from './enums/notification-channels.enum';
import { DeviceToken } from './fcm-token.entity';
import { FcmTokensService } from './fcm-tokens.service';

const ok = (): SendResponse => ({ success: true, messageId: 'id' });
const fail = (code: string): SendResponse =>
  ({ success: false, error: { code } }) as SendResponse;

const batch = (responses: SendResponse[]): BatchResponse => ({
  responses,
  successCount: responses.filter((r) => r.success).length,
  failureCount: responses.filter((r) => !r.success).length,
});

const devices = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ token: `t${i}` }) as DeviceToken);

/** Reads the array back out of a TypeORM `In(...)` / `LessThan(...)` operator. */
const operandOf = <T>(
  where: FindOptionsWhere<DeviceToken>,
  key: keyof DeviceToken,
) => (where[key] as unknown as FindOperator<T>).value;

describe('FcmTokensService', () => {
  let service: FcmTokensService;
  let messaging: {
    sendEachForMulticast: jest.Mock<Promise<BatchResponse>, [MulticastMessage]>;
  };
  let tokens: {
    find: jest.Mock<Promise<DeviceToken[]>, [unknown]>;
    delete: jest.Mock<Promise<DeleteResult>, [FindOptionsWhere<DeviceToken>]>;
    upsert: jest.Mock;
  };

  const sentMessage = (call: number): MulticastMessage =>
    messaging.sendEachForMulticast.mock.calls[call][0];

  const deleteFilter = (call: number): FindOptionsWhere<DeviceToken> =>
    tokens.delete.mock.calls[call][0];

  beforeEach(async () => {
    messaging = {
      sendEachForMulticast: jest.fn<
        Promise<BatchResponse>,
        [MulticastMessage]
      >(),
    };
    tokens = {
      find: jest.fn<Promise<DeviceToken[]>, [unknown]>().mockResolvedValue([]),
      delete: jest
        .fn<Promise<DeleteResult>, [FindOptionsWhere<DeviceToken>]>()
        .mockResolvedValue({ affected: 1, raw: [] }),
      upsert: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FcmTokensService,
        { provide: FIREBASE_MESSAGING, useValue: messaging },
        { provide: getRepositoryToken(DeviceToken), useValue: tokens },
        { provide: firebaseConfig.KEY, useValue: { tokenTtlDays: 60 } },
      ],
    }).compile();

    service = moduleRef.get(FcmTokensService);
    // The service logs on every failure path; keep the test output readable.
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('registerToken', () => {
    it('upserts on the token so a re-used device changes hands', async () => {
      await service.registerToken(7, {
        token: 'abc',
        platform: DevicePlatform.ANDROID,
      });

      expect(tokens.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'abc', userId: 7 }),
        { conflictPaths: ['token'] },
      );
    });
  });

  describe('removeToken', () => {
    it('throws when the token belonged to nobody', async () => {
      tokens.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.removeToken(1, 'nope')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('resolves when a row was deleted', async () => {
      await expect(service.removeToken(1, 'yes')).resolves.toEqual({
        message: 'Device token removed successfully',
      });
    });
  });

  describe('sendToUser', () => {
    const push = () =>
      service.sendToUser(
        1,
        { title: 't', body: 'b' },
        FCMChannels.APPOINTMENTS,
      );

    it('short-circuits when the user has no devices', async () => {
      await expect(push()).resolves.toEqual({ sent: 0, failed: 0 });
      expect(messaging.sendEachForMulticast).not.toHaveBeenCalled();
    });

    it('splits sends into batches of 500', async () => {
      tokens.find.mockResolvedValue(devices(501));
      messaging.sendEachForMulticast
        .mockResolvedValueOnce(batch(Array.from({ length: 500 }, ok)))
        .mockResolvedValueOnce(batch([ok()]));

      await expect(push()).resolves.toEqual({ sent: 501, failed: 0 });

      expect(messaging.sendEachForMulticast).toHaveBeenCalledTimes(2);
      expect(sentMessage(0).tokens).toHaveLength(500);
      expect(sentMessage(1).tokens).toHaveLength(1);
    });

    it('carries android, apns and webpush blocks so mixed devices all render', async () => {
      tokens.find.mockResolvedValue(devices(1));
      messaging.sendEachForMulticast.mockResolvedValue(batch([ok()]));

      await service.sendToUser(
        1,
        { title: 't', body: 'b', link: 'https://example.com' },
        FCMChannels.APPOINTMENTS,
      );

      const message = sentMessage(0);
      expect(message.android?.notification?.channelId).toBe(
        FCMChannels.APPOINTMENTS,
      );
      expect(message.apns?.payload?.aps.sound).toBe('default');
      expect(message.webpush?.fcmOptions).toEqual({
        link: 'https://example.com',
      });
    });

    it('counts a thrown batch as failed without propagating', async () => {
      tokens.find.mockResolvedValue(devices(3));
      messaging.sendEachForMulticast.mockRejectedValue(new Error('FCM down'));

      await expect(push()).resolves.toEqual({ sent: 0, failed: 3 });
      expect(tokens.delete).not.toHaveBeenCalled();
    });

    it('deletes tokens FCM reports as dead', async () => {
      tokens.find.mockResolvedValue(devices(2));
      messaging.sendEachForMulticast.mockResolvedValue(
        batch([
          fail('messaging/registration-token-not-registered'),
          fail('messaging/invalid-registration-token'),
        ]),
      );

      await push();

      expect(operandOf<string[]>(deleteFilter(0), 'token')).toEqual([
        't0',
        't1',
      ]);
    });

    it('keeps tokens on invalid-argument, which also fires for a bad payload', async () => {
      tokens.find.mockResolvedValue(devices(2));
      messaging.sendEachForMulticast.mockResolvedValue(
        batch([fail('messaging/invalid-argument'), ok()]),
      );

      await expect(push()).resolves.toEqual({ sent: 1, failed: 1 });
      // Deleting here would wipe every valid token on one malformed payload.
      expect(tokens.delete).not.toHaveBeenCalled();
    });
  });

  describe('pruneStaleTokens', () => {
    it('deletes tokens older than the configured TTL', async () => {
      tokens.delete.mockResolvedValue({ affected: 4, raw: [] });

      await expect(service.pruneStaleTokens()).resolves.toEqual({ pruned: 4 });

      const cutoff = operandOf<Date>(deleteFilter(0), 'lastSeenAt');
      const daysAgo = (Date.now() - cutoff.getTime()) / 86_400_000;
      expect(daysAgo).toBeCloseTo(60, 1);
    });
  });
});
