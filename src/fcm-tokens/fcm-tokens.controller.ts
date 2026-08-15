import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FcmTokensService } from './fcm-tokens.service';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@ApiTags('FCM Tokens')
@ApiBearerAuth('JWT-auth')
@Controller('fcm-tokens')
export class FcmTokensController {
  constructor(private readonly fcmTokensService: FcmTokensService) {}

  @Post()
  @ApiOperation({
    summary: 'Register the current device for push notifications',
  })
  @ApiBody({ type: RegisterDeviceTokenDto })
  @ApiCreatedResponse({ description: 'Device token registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async registerToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return await this.fcmTokensService.registerToken(user.userId, dto);
  }

  @Delete(':token')
  @ApiOperation({
    summary: 'Remove a device token on logout or token rotation',
  })
  @ApiParam({
    name: 'token',
    type: String,
    description: 'FCM registration token',
  })
  @ApiOkResponse({ description: 'Device token removed successfully' })
  @ApiResponse({ status: 404, description: 'Device token not found' })
  async removeToken(
    @CurrentUser() user: AuthenticatedUser,
    @Param('token') token: string,
  ) {
    return await this.fcmTokensService.removeToken(user.userId, token);
  }
}
