import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentSubjectEnrollmentController } from './student-subject-enrollment.controller';
import { StudentSubjectEnrollmentService } from './student-subject-enrollment.service';
import { StudentSubjectEnrollment } from './student-subject-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentSubjectEnrollment])],
  providers: [StudentSubjectEnrollmentService],
  controllers: [StudentSubjectEnrollmentController],
  exports: [StudentSubjectEnrollmentService],
})
export class StudentSubjectEnrollmentModule {}
