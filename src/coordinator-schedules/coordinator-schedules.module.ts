import { Module } from '@nestjs/common';
import { CoordinatorScheduleService } from './coordinator-schedules.service';
import { CoordinatorScheduleController } from './coordinator-schedules.controller';
import { CoordinatorSchedule } from './coordniator-schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinatorModule } from 'src/coordinators/coordinator.module';

@Module({
  imports: [TypeOrmModule.forFeature([CoordinatorSchedule]), CoordinatorModule],
  providers: [CoordinatorScheduleService],
  controllers: [CoordinatorScheduleController],
})
export class CoordinatorScheduleModule {}
