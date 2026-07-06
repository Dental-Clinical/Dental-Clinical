import { Module } from '@nestjs/common';
import { InitialExaminationService } from './initial-examination.service';
import { InitialExaminationController } from './initial-examination.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialExamination } from './initial-examination.entity';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { User } from 'src/users/user.entity';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';

@Module({
  providers: [InitialExaminationService],
  controllers: [InitialExaminationController],
  imports: [
    TypeOrmModule.forFeature([
      InitialExamination,
      Coordinator,
      User,
      ExaminationRequest,
    ])
  ]
})
export class InitialExaminationModule { }
