import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisHealthService implements OnModuleInit {
  async onModuleInit() {
    const client = createClient({
      url: process.env.REDIS_URL,
      // socket: {
      //   host: process.env.REDIS_HOST,
      //   port: parseInt(process.env.REDIS_PORT || '6379'),
      // },
    });

    try {
      await client.connect();

      console.log(await client.ping());

      console.log('✅ Connected to Upstash Redis');

      await client.disconnect();
    } catch (err) {
      console.error('❌ Failed to connect to Upstash Redis');
      console.error(err);
    }
  }
}
