import { Module } from '@nestjs/common';
import { SubjectDiagnosisController } from './subject-diagnosis.controller';
import { SubjectDiagnosisService } from './subject-diagnosis.service';
import { SubjectDiagnosisQuestionOption } from './subject-diagnosis-answer-option.entity';
import { SubjectDiagnosisQuestion } from './subject-diagnosis-questions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/subjects/subjects.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubjectDiagnosisQuestion,
      SubjectDiagnosisQuestionOption,
      Subject,
    ]),
  ],
  controllers: [SubjectDiagnosisController],
  providers: [SubjectDiagnosisService],
})
export class SubjectDiagnosisModule {}
