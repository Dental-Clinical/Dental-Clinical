import type { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import firebaseConfig from 'src/config/firebase.config';

export const FIREBASE_MESSAGING = 'FIREBASE_MESSAGING';

export const firebaseProvider: Provider = {
  provide: FIREBASE_MESSAGING,
  useFactory: (config: ConfigType<typeof firebaseConfig>): Messaging => {
    const { projectId, clientEmail, privateKey } = config;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase credentials are missing: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY',
      );
    }

    const apps = getApps();
    const app: App = apps.length
      ? apps[0]
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });

    return getMessaging(app);
  },
  inject: [firebaseConfig.KEY],
};
