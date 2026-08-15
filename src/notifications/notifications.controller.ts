import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FCMChannels } from '../fcm-tokens/enums/notification-channels.enum';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './enums/notification-type.enum';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import {
  GetNotificationsResponseDto,
  MarkAllReadResponseDto,
  MarkReadResponseDto,
} from './dto/notification-response.dto';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: "List the current user's notifications",
    description:
      'Newest first. `unreadCount` covers the whole inbox rather than the ' +
      'returned page, so it can drive the badge under any filter.',
  })
  @ApiOkResponse({
    type: GetNotificationsResponseDto,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return await this.notificationsService.getNotifications(user.userId, query);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: "Mark all of the current user's notifications as read",
  })
  @ApiOkResponse({
    type: MarkAllReadResponseDto,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return await this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Notification ID',
  })
  @ApiOkResponse({
    type: MarkReadResponseDto,
    description: 'Notification marked as read',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.notificationsService.markAsRead(user.userId, id);
  }

  @Get('test-students')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Send a test notification to every active student',
    description:
      'Fans out one notification per active student, each with its own read ' +
      'state. Exposed as a GET so an admin can trigger it by visiting the ' +
      'URL; it writes rows, so keep it out of any prefetch or retry path.',
  })
  @ApiOkResponse({ description: 'Test notification sent to students' })
  @ApiResponse({ status: 403, description: 'Caller is not an admin' })
  async sendTestToStudents() {
    return await this.notificationsService.notifyAllStudents();
  }

  @Post('test')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: "Send a test notification to the calling admin's own devices",
    description:
      'Targets only the caller, so it cannot be used to notify other users. ' +
      'Records the notification and pushes it, exercising the full path.',
  })
  @ApiCreatedResponse({
    description: 'Test notification created and dispatched',
  })
  @ApiResponse({ status: 403, description: 'Caller is not an admin' })
  async sendTest(@CurrentUser() user: AuthenticatedUser) {
    return await this.notificationsService.notifyUser(
      user.userId,
      {
        title: 'Test notification',
        body: 'Push delivery is working.',
      },
      NotificationType.TEST,
      FCMChannels.APPOINTMENTS,
    );
  }
}
