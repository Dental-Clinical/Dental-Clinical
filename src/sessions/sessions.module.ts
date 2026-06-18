import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { SessionsController } from './sessions.controller';

@Module({
  providers: [SessionsService],
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SessionsController],
})
export class SessionsModule {}
