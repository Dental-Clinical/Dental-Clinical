import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervisor } from './supervisor.entity';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/users/user.module';

@Module({
  controllers: [SupervisorController],
  providers: [SupervisorService],
  imports: [TypeOrmModule.forFeature([Supervisor]), CommonModule, UserModule],
})
export class SupervisorModule {}
