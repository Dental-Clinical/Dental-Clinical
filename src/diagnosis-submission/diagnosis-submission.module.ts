import { Module } from '@nestjs/common';
import { DiagnosisSubmissionController } from './diagnosis-submission.controller';
import { DiagnosisSubmissionService } from './diagnosis-submission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisSubmission } from './diagnosis-submission.entity';
import { StudentModule } from 'src/students/student.module';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { DiagnosisImages } from 'src/diagnosis-images/diagnosis-images.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiagnosisSubmission,
      PlannedProcedures,
      DiagnosisImages,
    ]),
    StudentModule,
    CloudinaryModule,
  ],
  controllers: [DiagnosisSubmissionController],
  providers: [DiagnosisSubmissionService],
})
export class DiagnosisSubmissionModule {}
