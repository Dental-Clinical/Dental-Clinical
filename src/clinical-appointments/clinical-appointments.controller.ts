import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
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
import { GetAvailableSlotDto } from 'src/examination-appointments/dto/get-available-slot.dto';
import { SupervisorAvailabilityService } from './supervisor-availability.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateStudentClinicalAppointmentDto } from './dto/create-student-clinical-appointment.dto';
import { ClinicalAppointmentsService } from './clinical-appointments.service';
import { UpdateStudentClinicalAppointmentDto } from './dto/update-student-clinical-appointment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@ApiTags('Clinical Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('clinical-appointments')
export class ClinicalAppointmentsController {
  constructor(
    private readonly supervisorAvailabilityService: SupervisorAvailabilityService,
    private readonly clinicalAppointmentService: ClinicalAppointmentsService,
  ) {}
  @Get('/available')
  @Roles([UserRole.STUDENT])
  @ApiOperation({ summary: 'Get available supervisor slots for a date' })
  @ApiOkResponse({ description: 'Available slots retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date or past date' })
  async getAvailableAppointments(
    @Query() dto: GetAvailableSlotDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.getAvailableSlots(
      currentUser,
      new Date(dto.date),
      dto.clinicalCaseId,
    );
  }

  @Get('/today')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: "Get today's clinical appointments for the current user",
  })
  @ApiOkResponse({
    description: "Today's clinical appointments retrieved successfully",
  })
  @ApiResponse({ status: 404, description: 'No appointments found for today' })
  async getTodayAppointments(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.clinicalAppointmentService.getTodayAppointments(
      currentUser,
    );
  }
  @Post()
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: 'Create a clinical appointment for a clinical case',
  })
  @ApiBody({ type: CreateStudentClinicalAppointmentDto })
  @ApiCreatedResponse({
    description: 'Clinical appointment created successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'Clinical Case, Student, Patient, Supervisor, Examination Request or Initial Examination not found',
  })
  @ApiResponse({
    status: 409,
    description: 'A clinical appointment already exists with the same data',
  })
  async createClinicalAppointment(
    @Body() dto: CreateStudentClinicalAppointmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.createStudentClinicalAppointment(
      user,
      dto,
    );
  }

  @Post(':id')
  // for now, we still don't know who does this
  @Roles([UserRole.STUDENT, UserRole.PATIENT, UserRole.SUPERVISOR])
  @ApiOperation({ summary: 'Update the status of a clinical appointment' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Clinical appointment ID',
  })
  @ApiBody({ type: UpdateStudentClinicalAppointmentDto })
  @ApiCreatedResponse({
    description: 'Clinical appointment updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Appointment does not belong to this user',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async updateClinicalAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentClinicalAppointmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.updateAppointment(
      id,
      user,
      dto,
    );
  }
}
