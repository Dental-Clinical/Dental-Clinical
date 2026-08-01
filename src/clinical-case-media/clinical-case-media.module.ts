import { Module } from '@nestjs/common';
import { ClinicalCaseMediaController } from './clinical-case-media.controller';
import { ClinicalCaseMediaService } from './clinical-case-media.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { StudentModule } from 'src/students/student.module';
import { ClinicalCaseMedia } from './clinical-case-media.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalCaseMedia]),
    StudentModule,
    CloudinaryModule,
  ],
  controllers: [ClinicalCaseMediaController],
  providers: [ClinicalCaseMediaService],
  exports: [ClinicalCaseMediaService],
})
export class ClinicalCaseMediaModule {}
