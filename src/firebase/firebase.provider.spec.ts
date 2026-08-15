import { Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Messaging } from 'firebase-admin/messaging';
import firebaseConfig from 'src/config/firebase.config';
import { firebaseProvider } from './firebase.provider';

type FirebaseConfig = ConfigType<typeof firebaseConfig>;

const build = (config: Partial<FirebaseConfig>): Messaging =>
  (
    firebaseProvider as {
      useFactory: (c: Partial<FirebaseConfig>) => Messaging;
    }
  ).useFactory(config);

describe('firebaseProvider', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('with credentials missing', () => {
    it('returns a stand-in instead of throwing, so the API still boots', () => {
      expect(() => build({})).not.toThrow();
    });

    it('is not thenable — Nest awaits useFactory results and would hang', () => {
      const messaging = build({}) as unknown as Record<string, unknown>;

      // Regression: a bare Proxy answers `then` with a function, which makes
      // Nest treat the provider as a promise and await it during bootstrap.
      expect(messaging.then).toBeUndefined();
      expect(messaging.catch).toBeUndefined();
      expect(messaging.finally).toBeUndefined();
    });

    it('rejects sends so callers count them as failures', async () => {
      const messaging = build({ projectId: 'p', clientEmail: 'e' });

      await expect(
        messaging.sendEachForMulticast({ tokens: ['t'] }),
      ).rejects.toThrow('Firebase messaging is not configured');
    });
  });
});
