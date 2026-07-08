import { Module } from '@nestjs/common';
import { SupervisorAvailabilityService } from './supervisor-availability.service';
import { ClinicalAppointmentsController } from './clinical-appointments.controller';
import { ClinicalAppointmentsService } from './clinical-appointments.service';
import { SupervisorSchedule } from 'src/supervisor-schedules/supervisor-schedules.entity';
import { ClinicalAppointment } from './clinical-appointments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalAppointment, SupervisorSchedule]),
  ],
  providers: [SupervisorAvailabilityService, ClinicalAppointmentsService],
  controllers: [ClinicalAppointmentsController],
  exports: [SupervisorAvailabilityService, ClinicalAppointmentsService],
})
export class ClinicalAppointmentsModule {}
