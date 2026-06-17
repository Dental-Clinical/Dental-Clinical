import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from './config/jwt.config';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { connectionSource } from './database/database.config';
import { AuthModule } from './auth/auth.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(connectionSource.options),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        ttl: configService.get('redis.ttl'),
        isGlobal: true,
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
