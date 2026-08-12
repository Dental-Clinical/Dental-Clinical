import { Logger, type Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { App, cert, getApp, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import firebaseConfig from 'src/config/firebase.config';

export const FIREBASE_MESSAGING = 'FIREBASE_MESSAGING';

/** Named so we never adopt an app initialized elsewhere with other credentials. */
const FIREBASE_APP_NAME = 'dental-clinical';

/**
 * Push is an auxiliary channel, so missing credentials must not stop the API
 * from booting. Every send fails soft and is counted, exactly as a network
 * failure would be.
 */
function disabledMessaging(logger: Logger): Messaging {
  // Nest awaits whatever a useFactory returns. A proxy that answers to `then`
  // looks like a thenable, so bootstrap would await it and hang on the
  // rejection. Refuse the promise protocol and symbol lookups.
  const promiseProtocol = new Set<string | symbol>([
    'then',
    'catch',
    'finally',
  ]);

  return new Proxy({} as Messaging, {
    get(_target, prop) {
      if (typeof prop === 'symbol' || promiseProtocol.has(prop)) {
        return undefined;
      }

      return () => {
        logger.warn(
          `Push notifications are disabled - ignoring messaging.${String(prop)}()`,
        );
        return Promise.reject(
          new Error('Firebase messaging is not configured'),
        );
      };
    },
  });
}

export const firebaseProvider: Provider = {
  provide: FIREBASE_MESSAGING,
  useFactory: (config: ConfigType<typeof firebaseConfig>): Messaging => {
    const logger = new Logger('FirebaseProvider');
    const { projectId, clientEmail, privateKey } = config;

    if (!projectId || !clientEmail || !privateKey) {
      logger.error(
        'Firebase credentials are missing - push notifications are DISABLED. ' +
          'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to enable them.',
      );
      return disabledMessaging(logger);
    }

    let app: App;
    try {
      app = getApp(FIREBASE_APP_NAME);
    } catch {
      app = initializeApp(
        { credential: cert({ projectId, clientEmail, privateKey }) },
        FIREBASE_APP_NAME,
      );
    }

    logger.log(`Firebase messaging initialized for project ${projectId}`);
    return getMessaging(app);
  },
  inject: [firebaseConfig.KEY],
};
