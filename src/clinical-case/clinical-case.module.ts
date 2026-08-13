import { Module } from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';
import { ClinicalCaseController } from './clinical-case.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalCase } from './clinical-case.entity';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
import { StudentModule } from 'src/students/student.module';
import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { PatientsModule } from 'src/patients/patients.module';
import { ClinicalAppointmentsModule } from 'src/clinical-appointments/clinical-appointments.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClinicalCase,
      InitialExamination,
      DiagnosisSubmission,
      TreatmentSession,
      ClinicalAppointment,
      SessionMaterial,
    ]),
    StudentModule,
    PatientsModule,
    ClinicalAppointmentsModule,
    CloudinaryModule,
  ],
  providers: [ClinicalCaseService],
  controllers: [ClinicalCaseController],
  exports: [ClinicalCaseService],
})
export class ClinicalCaseModule {}
