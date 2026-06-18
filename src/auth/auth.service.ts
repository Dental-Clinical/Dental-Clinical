import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PasswordService } from 'src/common/services/password.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { SendOtpDto } from './dto/sendOtp.dto';
import { OtpService } from './services/otp.service';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { randomUUID } from 'crypto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtOptions: ConfigType<typeof jwtConfig>,
    private readonly whatsappService: WhatsappService,
    private readonly otpService: OtpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  public async sendOtp(otpDto: SendOtpDto): Promise<void> {
    try {
      const isCooldownActive = await this.otpService.isCooldownActive(
        otpDto.phone,
      );

      if (isCooldownActive) {
        throw new HttpException(
          'Please wait before requesting another OTP',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      const otp = this.otpService.generateOtp();

      await this.whatsappService.sendOtp(otpDto.phone, otp);

      await this.otpService.storeOtp(otpDto.phone, otp);

      await this.otpService.setCooldown(otpDto.phone);
    } catch (error) {
      throw error;
    }
  }
  public async verifyOtp(verifyDto: VerifyOtpDto) {
    try {
      const isValid = await this.otpService.verifyOtp(
        verifyDto.phone,
        verifyDto.otp,
      );
      if (!isValid) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }
      const registrationToken = randomUUID();
      await this.cacheManager.set(
        `registration:${registrationToken}`,
        { phone: verifyDto.phone },
        1000 * 60 * 10, // 10 minutes
      );
      return {
        registrationToken,
      };
    } catch (error) {
      throw error;
    }
  }
  public async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.jwtOptions.secret,
      expiresIn: this.jwtOptions.expiresIn,
      audience: this.jwtOptions.audience,
      issuer: this.jwtOptions.issuer,
    });
  }
}
