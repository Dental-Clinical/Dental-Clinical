import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionSubjectController } from './section-subject.controller';
import { SectionSubjectService } from './section-subject.service';
import { SectionSubject } from './section-subject.entity';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Section } from 'src/section/section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SectionSubject,
      Section,
      Subject,
      Supervisor,
      AcademicYear,
    ]),
  ],
  providers: [SectionSubjectService],
  controllers: [SectionSubjectController],
  exports: [SectionSubjectService],
})
export class SectionSubjectModule { }
