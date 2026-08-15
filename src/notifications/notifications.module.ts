import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmTokensModule } from '../fcm-tokens/fcm-tokens.module';
import { Student } from '../students/student.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';

@Module({
  imports: [
    // Student is registered here rather than importing StudentModule, which
    // would pull in UserModule (a forwardRef) and CommonModule just to read
    // student user ids.
    TypeOrmModule.forFeature([Notification, Student]),
    FcmTokensModule,
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
