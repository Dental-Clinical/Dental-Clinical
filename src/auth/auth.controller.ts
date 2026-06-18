import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { SendOtpDto } from './dto/sendOtp.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // will be protected by the global jwt auth guard
  @Get('me')
  @HttpCode(HttpStatus.OK)
  public me() {
    return 'hello world';
  }
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  public async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  public async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}
