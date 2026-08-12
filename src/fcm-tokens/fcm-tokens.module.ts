import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModule } from '../firebase/firebase.module';
import { FcmTokensController } from './fcm-tokens.controller';
import { FcmTokensService } from './fcm-tokens.service';
import { DeviceToken } from './fcm-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken]), FirebaseModule],
  providers: [FcmTokensService],
  controllers: [FcmTokensController],
  exports: [FcmTokensService],
})
export class FcmTokensModule {}
