import { Module } from '@nestjs/common';
import { SupervisorAvailabilityService } from './supervisor-availability.service';
import { ClinicalAppointmentsController } from './clinical-appointments.controller';
import { ClinicalAppointmentsService } from './clinical-appointments.service';
import { SupervisorSchedule } from 'src/supervisor-schedules/supervisor-schedules.entity';
import { ClinicalAppointment } from './clinical-appointments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { Student } from 'src/students/student.entity';
import { Patient } from 'src/patients/patient.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalAppointment, SupervisorSchedule, ClinicalCase, Student, Patient, Supervisor, ExaminationRequest, InitialExamination]),
  ],
  providers: [SupervisorAvailabilityService, ClinicalAppointmentsService],
  controllers: [ClinicalAppointmentsController],
  exports: [SupervisorAvailabilityService, ClinicalAppointmentsService],
})
export class ClinicalAppointmentsModule { }
