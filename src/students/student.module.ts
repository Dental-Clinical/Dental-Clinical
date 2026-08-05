import { forwardRef, Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { UserModule } from 'src/users/user.module';
import { CommonModule } from 'src/common/common.module';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentSubjectEnrollment,
      SectionSubject,
      StudentAcademicYear,
    ]),
    forwardRef(() => UserModule),
    CommonModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
