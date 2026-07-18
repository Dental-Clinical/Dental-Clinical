import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectProceduresService } from './subject-procedures.service';
import { SubjectProceduresController } from './subject-procedures.controller';
import { SubjectProcedures } from './subject-procedures.entity';
import { Subject } from 'src/subjects/subjects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectProcedures, Subject])],
  providers: [SubjectProceduresService],
  controllers: [SubjectProceduresController],
  exports: [SubjectProceduresService],
})
export class SubjectProceduresModule {}
