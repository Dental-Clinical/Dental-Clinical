import { Module } from '@nestjs/common';
import { TreatmentSessionsController } from './treatment-sessions.controller';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { TreatmentSession } from './treatment-sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from 'src/students/student.module';
import { SessionProcedure } from 'src/sesssion-procedures/session-procedures.entity';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { ClinicalAppointmentsModule } from 'src/clinical-appointments/clinical-appointments.module';
import { Material } from 'src/materials/materials.entity';
import { SupervisorModule } from 'src/supervisors/supervisor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreatmentSession,
      ClinicalCase,
      DiagnosisSubmission,
      SessionProcedure,
      PlannedProcedures,
      Material,
    ]),
    StudentModule,
    SupervisorModule,
    ClinicalAppointmentsModule,
  ],
  controllers: [TreatmentSessionsController],
  providers: [TreatmentSessionsService],
})
export class TreatmentSessionsModule {}
