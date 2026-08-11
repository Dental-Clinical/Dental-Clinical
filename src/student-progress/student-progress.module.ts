import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';
import { StudentProgress } from './student-progress.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { StudentModule } from 'src/students/student.module';
import { ClinicalCaseModule } from 'src/clinical-case/clinical-case.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentProgress, SubjectProcedures]),
    StudentModule,
    ClinicalCaseModule,
  ],
  providers: [StudentProgressService],
  controllers: [StudentProgressController],
  exports: [StudentProgressService],
})
export class StudentProgressModule {}
