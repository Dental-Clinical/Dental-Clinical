import { Module } from '@nestjs/common';
import { ClinicalCaseService } from './clinical-case.service';
import { ClinicalCaseController } from './clinical-case.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalCase } from './clinical-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalCase])],
  providers: [ClinicalCaseService],
  controllers: [ClinicalCaseController],
})
export class ClinicalCaseModule {}
