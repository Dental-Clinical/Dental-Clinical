import { registerAs } from '@nestjs/config';

export default registerAs('ultramsg', () => ({
  token: process.env.ULTRAMSG_TOKEN,
  instanceId: process.env.ULTRAMSG_INSTANCE_ID,
  apiUrl: process.env.ULTRAMSG_API_URL,
}));
