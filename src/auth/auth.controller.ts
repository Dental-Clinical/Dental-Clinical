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
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { StaffLoginDto } from './dto/staffLogin.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // will be protected by the global jwt auth guard
  @Get('me')
  @HttpCode(HttpStatus.OK)
  public me() {
    return 'hello world';
  }
  // register
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('register/send-otp')
  public async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendRegistrationOtp(dto);
  }
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('register/verify-otp')
  public async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegistrationOtp(dto);
  }
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  public async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  // login
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('login/send-otp')
  public async sendLoginOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendLoginOtp(dto);
  }
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('login/verify-otp')
  public async verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('staff/login')
  public async staffLogin(@Body() dto: StaffLoginDto) {
    return this.authService.staffLogin(dto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  public async logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  public async logoutAll(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logoutAll(user.userId);
  }
}
