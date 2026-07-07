import { Module } from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';
import { ClinicalCaseController } from './clinical-case.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalCase } from './clinical-case.entity';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalCase, InitialExamination])],
  providers: [ClinicalCaseService],
  controllers: [ClinicalCaseController],
  exports: [ClinicalCaseService]
})
export class ClinicalCaseModule { }
