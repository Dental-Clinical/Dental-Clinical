import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateCoordinatorScheduleDto } from './dto/create-coordinator-schedule.dto';
import { CoordinatorScheduleService } from './coordinator-schedules.service';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
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
import { UpdateCoordinatorScheduleDto } from './dto/update-coordinator-schedule.dto';
import {
  CreateScheduleResponseDto,
  GetScheduleResponseDto,
  UpdateScheduleResponseDto,
  DeleteScheduleResponseDto,
} from './dto/coordinator-schedule-response.dto';

@ApiTags('Coordinator Schedules')
@ApiBearerAuth('JWT-auth')
@Controller('coordinator-schedules')
export class CoordinatorScheduleController {
  constructor(
    private readonly coordinatorScheduleService: CoordinatorScheduleService,
  ) {}

  @Post()
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Create a coordinator schedule' })
  @ApiCreatedResponse({
    type: CreateScheduleResponseDto,
    description: 'Schedule created successfully',
  })
  @ApiBody({ type: CreateCoordinatorScheduleDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Coordinator not found' })
  @ApiResponse({
    status: 409,
    description: 'Schedule already exists for this day',
  })
  async createSchedule(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCoordinatorScheduleDto,
  ) {
    return await this.coordinatorScheduleService.createSchedule(
      currentUser.userId,
      dto,
    );
  }

  @Get()
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get coordinator weekly schedule' })
  @ApiOkResponse({
    type: GetScheduleResponseDto,
    description: 'Coordinator schedule retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Coordinator not found' })
  async getMySchedule(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.coordinatorScheduleService.getMySchedule(
      currentUser.userId,
    );
  }

  @Patch(':id')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Update a coordinator schedule' })
  @ApiOkResponse({
    type: UpdateScheduleResponseDto,
    description: 'Schedule updated successfully',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Schedule ID' })
  @ApiBody({ type: UpdateCoordinatorScheduleDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Coordinator or schedule not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Schedule already exists for this day',
  })
  async updateSchedule(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateCoordinatorScheduleDto,
    @Param('id') scheduleId: number,
  ) {
    return await this.coordinatorScheduleService.updateSchedule(
      currentUser.userId,
      dto,
      scheduleId,
    );
  }

  @Delete(':id')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Delete a coordinator schedule' })
  @ApiOkResponse({
    type: DeleteScheduleResponseDto,
    description: 'Schedule deleted successfully',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Schedule ID' })
  @ApiResponse({
    status: 404,
    description: 'Coordinator or schedule not found',
  })
  async deleteSchedule(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') scheduleId: number,
  ) {
    return await this.coordinatorScheduleService.deleteSchedule(
      currentUser.userId,
      scheduleId,
    );
  }
}
