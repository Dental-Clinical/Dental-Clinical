import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalCaseEvaluationController } from './clinical-case-evaluation.controller';
import { ClinicalCaseEvaluationService } from './clinical-case-evaluation.service';
import { ClinicalCaseEvaluation } from './clinical-case-evaluation.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { SupervisorModule } from 'src/supervisors/supervisor.module';
import { StudentModule } from 'src/students/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalCaseEvaluation, ClinicalCase]),
    SupervisorModule,
    StudentModule,
  ],
  controllers: [ClinicalCaseEvaluationController],
  providers: [ClinicalCaseEvaluationService]
})
export class ClinicalCaseEvaluationModule {}
