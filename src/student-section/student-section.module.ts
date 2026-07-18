import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentSectionService } from './student-section.service';
import { StudentSectionController } from './student-section.controller';
import { StudentSection } from './student-section.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentSection,
      StudentAcademicYear,
      ClinicSections,
    ]),
  ],
  providers: [StudentSectionService],
  controllers: [StudentSectionController],
  exports: [StudentSectionService],
})
export class StudentSectionModule {}
