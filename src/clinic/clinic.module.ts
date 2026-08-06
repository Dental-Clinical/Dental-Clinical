import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import { Clinic } from './clinic.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { Section } from 'src/section/section.entity';
import { Subject } from 'src/subjects/subjects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, AcademicYear, Subject, Section])],
  providers: [ClinicService],
  controllers: [ClinicController],
  exports: [ClinicService],
})
export class ClinicModule {}
