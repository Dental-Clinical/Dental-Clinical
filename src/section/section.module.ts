import { SectionController } from './section.controller';
import { SectionService } from './section.service';
import { Section } from './section.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Section,
      Clinic,
      SectionSubject,
      StudentSubjectEnrollment,
    ]),
  ],
  providers: [SectionService],
  controllers: [SectionController],
  exports: [SectionService],
})
export class SectionModule {}
