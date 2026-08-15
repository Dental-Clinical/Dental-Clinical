import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetSupervisorAvailableSlotDto } from 'src/clinical-appointments/dto/get-supervisor-available-slot.dto';
import { SupervisorAvailabilityService } from './supervisor-availability.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateStudentClinicalAppointmentDto } from './dto/create-student-clinical-appointment.dto';
import { ClinicalAppointmentsService } from './clinical-appointments.service';
import { UpdateStudentClinicalAppointmentDto } from './dto/update-student-clinical-appointment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import {
  CancelAppointmentResponseDto,
  CreateClinicalAppointmentResponseDto,
  GetAvailableSupervisorSlotsResponseDto,
  GetPastAppointmentsResponseDto,
  GetStudentUpcomingAppointmentsResponseDto,
  GetTodayAppointmentsResponseDto,
  GetUpcomingAppointmentsResponseDto,
  NoShowAppointmentResponseDto,
  UpdateClinicalAppointmentResponseDto,
} from './dto/clinical-appointment-response.dto';

@ApiTags('Clinical Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('clinical-appointments')
export class ClinicalAppointmentsController {
  constructor(
    private readonly clinicalAppointmentService: ClinicalAppointmentsService,
  ) { }

  @Get('/available')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: '[Student] Get available supervisor slots for a date',
  })
  @ApiOkResponse({
    type: GetAvailableSupervisorSlotsResponseDto,
    description: 'Available slots retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid date or past date' })
  @ApiResponse({ status: 404, description: 'Clinical case not found' })
  @ApiResponse({
    status: 409,
    description: 'Clinical case is not open or already assigned',
  })
  async getAvailableAppointments(
    @Query() dto: GetSupervisorAvailableSlotDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.getAvailableSlots(
      currentUser,
      new Date(dto.date),
      dto.subjectId,
    );
  }

  @Get('/today')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: "[Student] Get today's clinical appointments for the current user",
  })
  @ApiOkResponse({
    type: GetTodayAppointmentsResponseDto,
    description: "Today's clinical appointments retrieved successfully",
  })
  @ApiResponse({ status: 404, description: 'No appointments found for today' })
  async getTodayAppointments(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.clinicalAppointmentService.getTodayAppointments(
      currentUser,
    );
  }

  @Get('/upcoming')
  @Roles([UserRole.PATIENT])
  @ApiOperation({
    summary:
      "[Patient] Get the current patient's upcoming clinical appointments",
  })
  @ApiOkResponse({
    type: GetUpcomingAppointmentsResponseDto,
    description: 'Upcoming appointments retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getUpcomingAppointments(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.clinicalAppointmentService.getUpcomingAppointments(
      currentUser,
    );
  }
  @Get('/student-upcoming')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary:
      "[Student] Get the current Student's upcoming clinical appointments, split into today's and later ones",
  })
  @ApiOkResponse({
    type: GetStudentUpcomingAppointmentsResponseDto,
    description: 'Upcoming appointments retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getUpcomingAppointmentsForStudent(
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.getUpcomingAppointmentsForStudent(
      currentUser,
    );
  }

  @Get('/past')
  @Roles([UserRole.PATIENT])
  @ApiOperation({
    summary: "[Patient] Get the current patient's past clinical appointments",
  })
  @ApiOkResponse({
    type: GetPastAppointmentsResponseDto,
    description: 'Past appointments retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPastAppointments(@CurrentUser() currentUser: AuthenticatedUser) {
    return await this.clinicalAppointmentService.getPastAppointments(
      currentUser,
    );
  }

  @Post()
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: '[Student] Create a clinical appointment for a clinical case',
  })
  @ApiBody({ type: CreateStudentClinicalAppointmentDto })
  @ApiCreatedResponse({
    type: CreateClinicalAppointmentResponseDto,
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
  @Roles([UserRole.STUDENT, UserRole.PATIENT, UserRole.SUPERVISOR])
  @ApiOperation({
    summary:
      '[Student] [Patient] [Supervisor] Update the status of a clinical appointment',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Clinical appointment ID',
  })
  @ApiBody({ type: UpdateStudentClinicalAppointmentDto })
  @ApiCreatedResponse({
    type: UpdateClinicalAppointmentResponseDto,
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

  @Patch('no-show/:id')
  @Roles([UserRole.STUDENT, UserRole.SUPERVISOR])
  @ApiOperation({
    summary: '[Student] [Supervisor] Mark a clinical appointment as no-show',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Clinical appointment ID',
  })
  @ApiOkResponse({
    type: NoShowAppointmentResponseDto,
    description: 'Clinical appointment marked as no-show successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Appointment does not belong to this user',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async noShowAppointment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.noShowAppointment(id, user);
  }

  @Patch('cancel/:id')
  @Roles([UserRole.STUDENT, UserRole.SUPERVISOR, UserRole.PATIENT])
  @ApiOperation({
    summary: '[Student] [Supervisor] [Patient] Cancel a clinical appointment',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Clinical appointment ID',
  })
  @ApiOkResponse({
    type: CancelAppointmentResponseDto,
    description: 'Clinical appointment cancelled successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Appointment does not belong to this user',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({
    status: 409,
    description: 'Only scheduled appointments can be cancelled',
  })
  async cancelAppointment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalAppointmentService.cancelAppointment(id, user);
  }

}
