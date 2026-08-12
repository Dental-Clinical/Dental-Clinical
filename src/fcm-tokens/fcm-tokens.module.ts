import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import firebaseConfig from 'src/config/firebase.config';
import { FirebaseModule } from '../firebase/firebase.module';
import { FcmTokensController } from './fcm-tokens.controller';
import { FcmTokensService } from './fcm-tokens.service';
import { DeviceToken } from './fcm-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceToken]),
    ConfigModule.forFeature(firebaseConfig),
    FirebaseModule,
  ],
  providers: [FcmTokensService],
  controllers: [FcmTokensController],
  exports: [FcmTokensService],
})
export class FcmTokensModule {}
