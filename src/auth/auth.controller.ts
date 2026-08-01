import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { SendOtpDto } from './dto/sendOtp.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { RegisterDto } from './dto/register.dto';
import { StaffLoginDto } from './dto/staffLogin.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';
import {
  AuthResponseDto,
  StaffLoginResponseDto,
} from './dto/auth-response.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiOkResponse({
    description: 'Current user info',
    schema: { example: 'hello world' },
  })
  public me() {
    return 'hello world';
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('register/send-otp')
  @ApiOperation({ summary: 'Send registration OTP' })
  @ApiOkResponse({
    description: 'OTP sent successfully',
  })
  @ApiResponse({
    status: 429,
    description: 'Please wait before requesting another OTP',
  })
  public async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendRegistrationOtp(dto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('register/verify-otp')
  @ApiOperation({ summary: 'Verify registration OTP' })
  @ApiOkResponse({
    type: VerifyOtpResponseDto,
    description: 'OTP verified successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  public async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegistrationOtp(dto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOperation({ summary: 'Complete patient registration' })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'Registration successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired registration token',
  })
  @ApiResponse({ status: 409, description: 'Patient already registered' })
  public async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('login/send-otp')
  @ApiOperation({ summary: 'Send login OTP' })
  @ApiOkResponse({ description: 'OTP sent successfully' })
  @ApiResponse({
    status: 404,
    description: 'Invalid phone number or account not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Please wait before requesting another OTP',
  })
  public async sendLoginOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendLoginOtp(dto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('login/verify-otp')
  @ApiOperation({ summary: 'Verify login OTP' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  public async verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }

  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @Post('staff/login')
  @ApiOperation({
    summary: 'Staff login with email/university ID and password',
  })
  @ApiOkResponse({
    type: StaffLoginResponseDto,
    description: 'Login successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public async staffLogin(@Body() dto: StaffLoginDto) {
    return this.authService.staffLogin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiOkResponse({ description: 'Logged out successfully' })
  public async logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout all sessions for the user' })
  @ApiOkResponse({ description: 'All sessions logged out successfully' })
  public async logoutAll(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logoutAll(user.userId);
  }
}
