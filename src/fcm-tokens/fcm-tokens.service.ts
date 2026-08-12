import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatchResponse, Messaging } from 'firebase-admin/messaging';
import { In, Repository } from 'typeorm';
import { FIREBASE_MESSAGING } from '../firebase/firebase.provider';
import { DeviceToken } from './fcm-token.entity';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { PushPayload } from './interfaces/push-payload.interface';
import { FCMChannels } from './enums/notification-channels.enum';

/** `sendEachForMulticast` rejects anything above this many tokens in one call. */
const MULTICAST_BATCH_SIZE = 500;

@Injectable()
export class FcmTokensService {
  private readonly logger = new Logger(FcmTokensService.name);

  constructor(
    @Inject(FIREBASE_MESSAGING) private readonly messaging: Messaging,
    @InjectRepository(DeviceToken)
    private readonly tokens: Repository<DeviceToken>,
  ) {}

  async registerToken(userId: number, dto: RegisterDeviceTokenDto) {
    // A token is unique per device install, but the device can change hands
    // (shared clinic tablet, re-login), so claim it for the caller instead of
    // colliding with the unique constraint.
    await this.tokens.upsert(
      {
        token: dto.token,
        platform: dto.platform,
        userId,
        lastSeenAt: new Date(),
      },
      { conflictPaths: ['token'] },
    );

    return { message: 'Device token registered successfully' };
  }

  async removeToken(userId: number, token: string) {
    const result = await this.tokens.delete({ token, userId });

    if (!result.affected) {
      throw new NotFoundException('Device token not found');
    }

    return { message: 'Device token removed successfully' };
  }

  async sendToUser(
    userId: number,
    payload: PushPayload,
    channelId: FCMChannels,
  ): Promise<{ sent: number; failed: number }> {
    const devices = await this.tokens.find({ where: { userId } });
    if (!devices.length) return { sent: 0, failed: 0 };

    const tokens = devices.map((d) => d.token);
    let sent = 0;
    let failed = 0;

    for (const batch of this.chunk(tokens, MULTICAST_BATCH_SIZE)) {
      // A push must never take down the operation that triggered it, so a
      // failed batch is logged and counted rather than thrown.
      try {
        const response = await this.messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title: payload.title, body: payload.body },
          data: payload.data,
          android: { priority: 'high', notification: { channelId } },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: payload.badge,
                contentAvailable: true,
              },
            },
          },
        });

        sent += response.successCount;
        failed += response.failureCount;
        await this.pruneInvalid(response, batch);
      } catch (error) {
        failed += batch.length;
        this.logger.error(
          `Failed to send push notification to user ${userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return { sent, failed };
  }

  private async pruneInvalid(response: BatchResponse, tokens: string[]) {
    // Only codes that mean "this token is dead". Notably not
    // messaging/invalid-argument, which also fires for a malformed payload and
    // would otherwise wipe every one of the user's valid tokens.
    const dead = response.responses
      .map((r, i) =>
        !r.success ? { code: r.error?.code, token: tokens[i] } : null,
      )
      .filter((x): x is { code: string; token: string } => x !== null)
      .filter(
        (x) =>
          x.code === 'messaging/registration-token-not-registered' ||
          x.code === 'messaging/invalid-registration-token',
      )
      .map((x) => x.token);

    if (dead.length) await this.tokens.delete({ token: In(dead) });
  }

  private chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }
}
