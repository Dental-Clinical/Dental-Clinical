import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { PasswordService } from 'src/common/services/password.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
