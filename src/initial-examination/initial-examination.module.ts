import { Module } from '@nestjs/common';
import { InitialExaminationService } from './initial-examination.service';
import { InitialExaminationController } from './initial-examination.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialExamination } from './initial-examination.entity';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { User } from 'src/users/user.entity';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ClinicalCaseModule } from 'src/clinical-case/clinical-case.module';
import { ExaminationAppointment } from 'src/examination-appointments/examination-appointment.entity';

@Module({
  providers: [InitialExaminationService],
  controllers: [InitialExaminationController],
  imports: [
    TypeOrmModule.forFeature([
      InitialExamination,
      Coordinator,
      User,
      ExaminationRequest,
      ExaminationAppointment
    ]),
    ClinicalCaseModule
  ],
  exports: [InitialExaminationService]
})
export class InitialExaminationModule { }
