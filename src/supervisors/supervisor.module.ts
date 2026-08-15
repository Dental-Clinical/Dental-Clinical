import { forwardRef, Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervisor } from './supervisor.entity';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/users/user.module';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { ConfigModule } from '@nestjs/config';
import ultramsgConfig from 'src/config/ultramsg.config';
import { ClinicalCaseModule } from 'src/clinical-case/clinical-case.module';
import { SupervisorSchedulesModule } from 'src/supervisor-schedules/supervisor-schedules.module';
import { SupervisorScheduleService } from 'src/supervisor-schedules/supervisor-schedules.service';

@Module({
  controllers: [SupervisorController],
  providers: [SupervisorService, WhatsappService],
  imports: [
    TypeOrmModule.forFeature([Supervisor]),
    CommonModule,
    UserModule,
    ConfigModule.forFeature(ultramsgConfig),
    ClinicalCaseModule,
    forwardRef(() => SupervisorSchedulesModule),
  ],
  exports: [SupervisorService],
})
export class SupervisorModule {}
