import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { Material } from './materials.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, Subject, SessionMaterial])],
  providers: [MaterialsService],
  controllers: [MaterialsController],
  exports: [MaterialsService],
})
export class MaterialsModule {}
