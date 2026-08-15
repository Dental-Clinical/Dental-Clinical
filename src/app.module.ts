import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { connectionSource } from './database/database.config';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { SessionsModule } from './sessions/sessions.module';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './users/user.module';
import { PatientsModule } from './patients/patients.module';
import { StudentModule } from './students/student.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { SupervisorModule } from './supervisors/supervisor.module';
import { CoordinatorModule } from './coordinators/coordinator.module';
import { CoordinatorScheduleModule } from './coordinator-schedules/coordinator-schedules.module';
import { ExaminationRequestsModule } from './examination-requests/examination-requests.module';
import { ExaminationAppointmentsModule } from './examination-appointments/examination-appointments.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { StudyYearsModule } from './study-years/study-years.module';
import { SubjectsModule } from './subjects/subjects.module';
import { InitialExaminationModule } from './initial-examination/initial-examination.module';
import { ClinicalCaseModule } from './clinical-case/clinical-case.module';
import { StudentAcademicYearsModule } from './student-academic-years/student-academic-years.module';
import { SupervisorSchedulesModule } from './supervisor-schedules/supervisor-schedules.module';
import { ClinicalAppointmentsModule } from './clinical-appointments/clinical-appointments.module';
import { SubjectProceduresModule } from './subject-procedures/subject-procedures.module';
import { DiagnosisSubmissionModule } from './diagnosis-submission/diagnosis-submission.module';
import { PlannedProceduresModule } from './planned-procedures/planned-procedures.module';
import { DiagnosisImagesModule } from './diagnosis-images/diagnosis-images.module';
import { SupervisorReviewsModule } from './supervisor-reviews/supervisor-reviews.module';
import { TreatmentSessionsModule } from './treatment-sessions/treatment-sessions.module';
import { ClinicalCaseEvaluationModule } from './clinical-case-evaluation/clinical-case-evaluation.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import redisConfig from './config/redis.config';
import firebaseConfig from './config/firebase.config';
import { RedisHealthService } from './redis-health.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ClinicalCaseMediaModule } from './clinical-case-media/clinical-case-media.module';
import { SectionModule } from './section/section.module';
import { ClinicModule } from './clinic/clinic.module';
import { SectionSubjectModule } from './section-subject/section-subject.module';
import { StudentSubjectEnrollmentModule } from './student-subject-enrollment/student-subject-enrollment.module';
import { MaterialsModule } from './materials/materials.module';
import { SubjectDiagnosisModule } from './subject-diagnosis/subject-diagnosis.module';
import { FcmTokensModule } from './fcm-tokens/fcm-tokens.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DentalAiModule } from './dental-ai/dental-ai.module';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      isGlobal: true,
      load: [redisConfig, firebaseConfig],
    }),
    HttpModule.register({ global: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(connectionSource.options),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('redis.url'),
          // host: configService.get('redis.host'),
          // port: configService.get('redis.port'),
        }),
        ttl: configService.get('redis.ttl'),
        isGlobal: true,
      }),
    }),
    AuthModule,
    SessionsModule,
    UserModule,
    PatientsModule,
    StudentModule,
    SupervisorModule,
    CoordinatorModule,
    CoordinatorScheduleModule,
    ExaminationRequestsModule,
    ExaminationAppointmentsModule,
    AcademicYearsModule,
    StudyYearsModule,
    SubjectsModule,
    InitialExaminationModule,
    ClinicalCaseModule,
    StudentAcademicYearsModule,
    SupervisorSchedulesModule,
    ClinicalAppointmentsModule,
    SubjectProceduresModule,
    DiagnosisSubmissionModule,
    PlannedProceduresModule,
    DiagnosisImagesModule,
    SupervisorReviewsModule,
    TreatmentSessionsModule,
    ClinicalCaseEvaluationModule,
    StudentProgressModule,
    CloudinaryModule,
    FirebaseModule,
    ClinicalCaseMediaModule,
    SectionModule,
    ClinicModule,
    SectionSubjectModule,
    StudentSubjectEnrollmentModule,
    MaterialsModule,
    SubjectDiagnosisModule,
    FcmTokensModule,
    NotificationsModule,
    DentalAiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    RedisHealthService,
  ],
})
export class AppModule {}
