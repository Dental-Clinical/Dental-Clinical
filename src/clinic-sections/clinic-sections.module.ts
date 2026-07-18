import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicSectionsService } from './clinic-sections.service';
import { ClinicSectionsController } from './clinic-sections.controller';
import { ClinicSections } from './clinic-sections.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicSections, Subject, Supervisor])],
  providers: [ClinicSectionsService],
  controllers: [ClinicSectionsController],
  exports: [ClinicSectionsService],
})
export class ClinicSectionsModule {}
