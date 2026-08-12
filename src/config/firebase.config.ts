import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  // A device that has not re-registered in this long is treated as gone. Relies
  // on the client re-registering its token on every app launch.
  tokenTtlDays: parseInt(process.env.FCM_TOKEN_TTL_DAYS ?? '60', 10),
}));
