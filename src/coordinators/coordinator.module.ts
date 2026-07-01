import { Module } from '@nestjs/common';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorService } from './coordinator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordinator } from './coordinator.entity';
import { CommonModule } from 'src/common/common.module';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { ConfigModule } from '@nestjs/config';
import ultramsgConfig from 'src/config/ultramsg.config';

@Module({
  controllers: [CoordinatorController],
  providers: [CoordinatorService, WhatsappService],
  imports: [
    TypeOrmModule.forFeature([Coordinator]),
    CommonModule,
    ConfigModule.forFeature(ultramsgConfig),
  ],
})
export class CoordinatorModule {}
