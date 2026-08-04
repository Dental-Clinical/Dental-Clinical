import { forwardRef, Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { UserModule } from 'src/users/user.module';
import { CommonModule } from 'src/common/common.module';
import { StudentSection } from 'src/student-section/student-section.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentSection,
      StudentSubjectEnrollment,
      SectionSubject,
    ]),
    forwardRef(() => UserModule),
    CommonModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
