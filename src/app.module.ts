import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
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

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      isGlobal: true,
    }),
    HttpModule.register({ global: true }),
    TypeOrmModule.forRoot(connectionSource.options),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
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
  ],
})
export class AppModule {}
