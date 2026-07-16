import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  url: process.env.REDIS_URL,
  port: process.env.REDIS_PORT,
  ttl: parseInt(process.env.REDIS_TTL ?? '3600', 10),
  password: process.env.REDIS_PASSWORD,
}));
