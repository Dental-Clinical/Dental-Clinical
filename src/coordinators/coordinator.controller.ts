import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoordinatorService } from './coordinator.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { CreateCoordinatorResponseDto } from './dto/create-coordinator-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@ApiTags('Coordinators')
@ApiBearerAuth('JWT-auth')
@Controller('coordinators')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Create a new coordinator' })
  @ApiCreatedResponse({
    type: CreateCoordinatorResponseDto,
    description: 'Coordinator created',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  public async createCoordinator(
    @Body() createCoordinatorDto: CreateCoordinatorDto,
  ) {
    return await this.coordinatorService.createCoordinator(
      createCoordinatorDto,
    );
  }
  @Get('appointments/today')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get today appointments for coordinator' })
  @ApiOkResponse({ description: 'Appointments retrieved' })
  @ApiResponse({ status: 404, description: 'Coordinator not found' })
  public async getCoordinatorAppointments(
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.coordinatorService.getTodayAppointmentsForCoordinator(
      currentUser.userId,
    );
  }
  @Get('appointments/upcoming')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get upcoming appointments for coordinator' })
  @ApiOkResponse({ description: 'Appointments retrieved' })
  @ApiResponse({ status: 404, description: 'Coordinator not found' })
  public async getUpcomingAppointments(
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.coordinatorService.getUpcomingAppointmentsForCoordinator(
      currentUser.userId,
    );
  }
  @Get('appointments/:appointmentId')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get appointment details for coordinator' })
  @ApiParam({
    name: 'appointmentId',
    type: Number,
    description: 'Appointment ID',
  })
  @ApiOkResponse({ description: 'Appointment details retrieved' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  public async getAppointmentDetails(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('appointmentId') appointmentId: number,
  ) {
    return this.coordinatorService.getAppointmentDetails(
      appointmentId,
      currentUser.userId,
    );
  }
}
