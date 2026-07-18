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
import { CreateSupervisorScheduleDto } from './dto/create-supervisor-schedule.dto';
import { SupervisorScheduleService } from './supervisor-schedules.service';
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
import { UpdateSupervisorScheduleDto } from './dto/update-supervisor-schedule.dto';
import {
  CreateSupervisorScheduleResponseDto,
  GetSupervisorScheduleResponseDto,
  UpdateSupervisorScheduleResponseDto,
  DeleteSupervisorScheduleResponseDto,
} from './dto/supervisor-schedule-response.dto';

@ApiTags('Supervisor Schedules')
@ApiBearerAuth('JWT-auth')
@Controller('supervisor-schedules')
export class SupervisorScheduleController {
  constructor(
    private readonly supervisorScheduleService: SupervisorScheduleService,
  ) {}

  @Post()
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({ summary: 'Create a supervisor schedule' })
  @ApiCreatedResponse({
    type: CreateSupervisorScheduleResponseDto,
    description: 'Schedule created successfully',
  })
  @ApiBody({ type: CreateSupervisorScheduleDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  @ApiResponse({
    status: 409,
    description: 'Schedule already exists for this day',
  })
  async createSchedule(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateSupervisorScheduleDto,
  ) {
    return await this.supervisorScheduleService.createSchedule(
      currentUser.userId,
      dto,
    );
  }

  @Get()
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({ summary: 'Get supervisor weekly schedule' })
  @ApiOkResponse({
    type: GetSupervisorScheduleResponseDto,
    description: 'Supervisor schedule retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async getMySchedule(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.supervisorScheduleService.getMySchedule(
      currentUser.userId,
    );
  }

  @Patch(':id')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({ summary: 'Update a supervisor schedule' })
  @ApiOkResponse({
    type: UpdateSupervisorScheduleResponseDto,
    description: 'Schedule updated successfully',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Schedule ID' })
  @ApiBody({ type: UpdateSupervisorScheduleDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Supervisor or schedule not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Schedule already exists for this day',
  })
  async updateSchedule(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateSupervisorScheduleDto,
    @Param('id') scheduleId: number,
  ) {
    return await this.supervisorScheduleService.updateSchedule(
      currentUser.userId,
      dto,
      scheduleId,
    );
  }

  @Delete(':id')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({ summary: 'Delete a supervisor schedule' })
  @ApiOkResponse({
    type: DeleteSupervisorScheduleResponseDto,
    description: 'Schedule deleted successfully',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Schedule ID' })
  @ApiResponse({
    status: 404,
    description: 'Supervisor or schedule not found',
  })
  async deleteSchedule(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') scheduleId: number,
  ) {
    return await this.supervisorScheduleService.deleteSchedule(
      currentUser.userId,
      scheduleId,
    );
  }
}
