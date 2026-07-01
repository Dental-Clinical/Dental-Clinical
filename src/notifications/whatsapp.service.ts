import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as qs from 'qs';
import ultramsgConfig from 'src/config/ultramsg.config';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(ultramsgConfig.KEY)
    private readonly ultramsgOptions: ConfigType<typeof ultramsgConfig>,
  ) {}
  async sendOtp(phone: string, otp: string) {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phone);
      const message = `Your OTP code is: ${otp}\n This Code is valid for 5 minutes.
      `;
      const data = qs.stringify({
        token: this.ultramsgOptions.token,
        to: normalizedPhone,
        body: message,
      });

      const response = await this.httpService.axiosRef.post(
        `${this.ultramsgOptions.apiUrl}/messages/chat`,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      if (response.status < 200 || response.status >= 300) {
        throw new InternalServerErrorException(
          'Failed to send OTP via WhatsApp',
        );
      }
      return {
        message: 'OTP sent successfully via WhatsApp',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP via WhatsApp');
    }
  }
  async sendPassword(password: string, phone: any) {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phone);
      const message = `Your password is: ${password}\n`;
      const data = qs.stringify({
        token: this.ultramsgOptions.token,
        to: normalizedPhone,
        body: message,
      });

      const response = await this.httpService.axiosRef.post(
        `${this.ultramsgOptions.apiUrl}/messages/chat`,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      if (response.status < 200 || response.status >= 300) {
        throw new InternalServerErrorException(
          'Failed to send password via WhatsApp',
        );
      }
      return {
        message: 'Password sent successfully via WhatsApp',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send password via WhatsApp',
      );
    }
  }

  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, ''); // Remove non-numeric characters
  }
}
