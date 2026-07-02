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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UpdateCoordinatorScheduleDto } from './dto/update-coordinator-schedule.dto';

@Controller('coordinator-schedules')
export class CoordinatorScheduleController {
  constructor(
    private readonly coordinatorScheduleService: CoordinatorScheduleService,
  ) {}
  @Post()
  @Roles([UserRole.COORDINATOR])
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
  @ApiOperation({
    summary: 'Get coordinator weekly schedule',
  })
  @ApiOkResponse({
    description: 'Coordinator schedule retrieved successfully',
  })
  async getMySchedule(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.coordinatorScheduleService.getMySchedule(
      currentUser.userId,
    );
  }
  @Patch(':id')
  @Roles([UserRole.COORDINATOR])
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
