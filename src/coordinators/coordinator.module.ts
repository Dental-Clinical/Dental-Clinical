import { Module } from '@nestjs/common';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorService } from './coordinator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordinator } from './coordinator.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [CoordinatorController],
  providers: [CoordinatorService],
  imports: [TypeOrmModule.forFeature([Coordinator]), CommonModule],
})
export class CoordinatorModule {}
