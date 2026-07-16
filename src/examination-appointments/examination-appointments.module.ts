import { Module } from '@nestjs/common';
import { ExaminationAppointmentsService } from './examination-appointments.service';
import { ExaminationAppointmentsController } from './examination-appointments.controller';
import { CoordinatorAvailabilityService } from './coordinator-availability.service';
import { ExaminationAppointment } from './examination-appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinatorSchedule } from 'src/coordinator-schedules/coordniator-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExaminationAppointment, CoordinatorSchedule]),
  ],
  providers: [ExaminationAppointmentsService, CoordinatorAvailabilityService],
  controllers: [ExaminationAppointmentsController],
  exports: [ExaminationAppointmentsService, CoordinatorAvailabilityService],
})
export class ExaminationAppointmentsModule {}
