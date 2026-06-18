import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { randomInt } from 'crypto';
@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  generateOtp(): string {
    const otp = randomInt(100000, 1000000).toString(); // generate a 6-digit OTP
    return otp;
  }
  async storeOtp(phone: string, otp: string): Promise<void> {
    await this.cacheManager.set(
      `otp:${phone}`,
      { code: otp, attempts: 3, expiresAt: Date.now() + 300000 },
      300,
    ); // store for 5 minutes
  }
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const result = await this.cacheManager.get<{
      code: string;
      attempts: number;
      expiresAt: number;
    }>(`otp:${phone}`);
    if (!result) {
      return false; // OTP not found or expired
    }
    if (Date.now() > result.expiresAt) {
      await this.deleteOtp(phone);
      return false; // OTP expired
    }
    if (result.attempts <= 0) {
      await this.deleteOtp(phone);
      return false; // No attempts left
    }
    if (result.code === otp) {
      await this.deleteOtp(phone);
      return true; // OTP is correct
    } else {
      const remainingTtl = Math.max(
        0,
        Math.floor((result.expiresAt - Date.now()) / 1000),
      );
      await this.cacheManager.set(
        `otp:${phone}`,
        {
          code: result.code,
          attempts: result.attempts - 1,
          expiresAt: result.expiresAt,
        },
        remainingTtl,
      ); // decrement attempts
      return false; // OTP is incorrect
    }
  }
  async deleteOtp(phone: string): Promise<void> {
    await this.cacheManager.del(`otp:${phone}`);
  }
}
