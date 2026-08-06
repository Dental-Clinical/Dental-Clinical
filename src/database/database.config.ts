import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
config({
  path: join(process.cwd(), envFile),
});

//export const connectionSource = new DataSource({
//  type: 'postgres',
//  port: parseInt(process.env.DB_PORT || '5432'),
//  host: process.env.DB_HOST || 'localhost',
//  username: process.env.DB_USERNAME,
//  password: process.env.DB_PASSWORD || 'password',
//  database: process.env.DB_NAME || 'dental-clinical',
//  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//  migrations: [__dirname + '/migrations/*{.ts,.js}'],
//  synchronize: false,
//  logging: ['error'],
//});

 export const connectionSource = new DataSource({
   type: 'postgres',
   url: process.env.DB_URL,
   ssl: true,
   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
   migrations: [__dirname + '/migrations/*{.ts,.js}'],
 });
