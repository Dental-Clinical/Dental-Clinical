import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './subjects.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Subject])], // Assuming you have a Subject entity
  providers: [SubjectsService],
  controllers: [SubjectsController],
})
export class SubjectsModule {}
