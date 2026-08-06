import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './subjects.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'src/materials/materials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, StudyYear, Clinic, Material])],
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService],
})
export class SubjectsModule {}
