import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentSubjectEnrollmentController } from './student-subject-enrollment.controller';
import { StudentSubjectEnrollmentService } from './student-subject-enrollment.service';
import { StudentSubjectEnrollment } from './student-subject-enrollment.entity';
import { Student } from 'src/students/student.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Section } from 'src/section/section.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentSubjectEnrollment,
      Student,
      Section,
      Subject,
      AcademicYear,
      StudentAcademicYear,
      SectionSubject,
      ClinicalCase,
    ]),
  ],
  providers: [StudentSubjectEnrollmentService],
  controllers: [StudentSubjectEnrollmentController],
  exports: [StudentSubjectEnrollmentService],
})
export class StudentSubjectEnrollmentModule {}
