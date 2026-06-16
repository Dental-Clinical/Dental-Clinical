import { join } from 'path';
import { DataSource } from 'typeorm';

export const connectionSource = new DataSource({
  type: 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'dental-clinical',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
