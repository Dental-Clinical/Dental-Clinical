import { Module } from '@nestjs/common';
import { InitialExaminationService } from './initial-examination.service';
import { InitialExaminationController } from './initial-examination.controller';

@Module({
  providers: [InitialExaminationService],
  controllers: [InitialExaminationController]
})
export class InitialExaminationModule {}
