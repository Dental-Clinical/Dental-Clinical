import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './subjects.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'src/materials/materials.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      StudyYear,
      Clinic,
      Material,
      SectionSubject,
      Supervisor,
    ]),
  ],
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService],
})
export class SubjectsModule {}
