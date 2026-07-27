import { Module } from '@nestjs/common';
import { StudyYearsService } from './study-years.service';
import { StudyYearsController } from './study-years.controller';

@Module({
  providers: [StudyYearsService],
  controllers: [StudyYearsController],
})
export class StudyYearsModule {}
