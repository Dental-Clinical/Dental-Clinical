import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';
import { AcademicYear } from './academic-years.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  providers: [AcademicYearsService],
  controllers: [AcademicYearsController],
  exports: [AcademicYearsService],
})
export class AcademicYearsModule {}
