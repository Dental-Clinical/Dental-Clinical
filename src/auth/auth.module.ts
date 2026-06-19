import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import jwtConfig from 'src/config/jwt.config';
import ultramsgConfig from 'src/config/ultramsg.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OtpService } from './services/otp.service';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    CommonModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(ultramsgConfig),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpService, WhatsappService],
})
export class AuthModule {}
