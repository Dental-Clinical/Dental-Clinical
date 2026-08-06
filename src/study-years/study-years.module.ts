import { Module } from '@nestjs/common';
import { StudyYearsService } from './study-years.service';
import { StudyYearsController } from './study-years.controller';
import { StudyYear } from './study-years.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StudyYear])],
  providers: [StudyYearsService],
  controllers: [StudyYearsController],
})
export class StudyYearsModule {}
