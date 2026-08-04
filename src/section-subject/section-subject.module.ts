import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionSubjectController } from './section-subject.controller';
import { SectionSubjectService } from './section-subject.service';
import { SectionSubject } from './section-subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SectionSubject])],
  providers: [SectionSubjectService],
  controllers: [SectionSubjectController],
  exports: [SectionSubjectService],
})
export class SectionSubjectModule {}
