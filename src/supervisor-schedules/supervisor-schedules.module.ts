import { forwardRef, Module } from '@nestjs/common';
import { SupervisorScheduleController } from './supervisor-schedules.controller';
import { SupervisorScheduleService } from './supervisor-schedules.service';
import { SupervisorSchedule } from './supervisor-schedules.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupervisorService } from 'src/supervisors/supervisor.service';
import { SupervisorModule } from 'src/supervisors/supervisor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupervisorSchedule]),
    forwardRef(() => SupervisorModule),
  ],
  providers: [SupervisorScheduleService],
  controllers: [SupervisorScheduleController],
  exports: [SupervisorScheduleService],
})
export class SupervisorSchedulesModule {}
