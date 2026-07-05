import { Module } from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';
import { ClinicalCaseController } from './clinical-case.controller';

@Module({
  providers: [ClinicalCaseService],
  controllers: [ClinicalCaseController]
})
export class ClinicalCaseModule {}
