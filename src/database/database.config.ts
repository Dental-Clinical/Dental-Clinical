import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({
  path: join(process.cwd(), `.env.${process.env.NODE_ENV}`),
});

export const connectionSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
