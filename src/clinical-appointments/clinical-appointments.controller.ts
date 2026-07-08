import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { GetAvailableSlotDto } from 'src/examination-appointments/dto/get-available-slot.dto';
import { SupervisorAvailabilityService } from './supervisor-availability.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';

@Controller('clinical-appointments')
export class ClinicalAppointmentsController {
  constructor(
    private readonly supervisorAvailabilityService: SupervisorAvailabilityService,
  ) {}
  @Get('/available')
  @Roles([UserRole.STUDENT])
  @ApiOperation({ summary: 'Get available appointment slots for a date' })
  @ApiQuery({
    name: 'date',
    type: String,
    example: '2025-12-25',
    description: 'Date to check availability (YYYY-MM-DD)',
  })
  @ApiOkResponse({ description: 'Available slots retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date or past date' })
  async getAvailableAppointments(@Query() dto: GetAvailableSlotDto) {
    return await this.supervisorAvailabilityService.getAvailableSlots(
      new Date(dto.date),
    );
  }
}
