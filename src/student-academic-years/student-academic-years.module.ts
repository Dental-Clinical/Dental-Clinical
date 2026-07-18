import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentAcademicYearsService } from './student-academic-years.service';
import { StudentAcademicYearsController } from './student-academic-years.controller';
import { StudentAcademicYear } from './student-academic-years.entity';
import { Student } from 'src/students/student.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { StudyYear } from 'src/study-years/study-years.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentAcademicYear,
      Student,
      AcademicYear,
      StudyYear,
    ]),
  ],
  providers: [StudentAcademicYearsService],
  controllers: [StudentAcademicYearsController],
  exports: [StudentAcademicYearsService],
})
export class StudentAcademicYearsModule {}
