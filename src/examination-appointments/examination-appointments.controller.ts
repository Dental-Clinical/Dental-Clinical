import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoordinatorAvailabilityService } from './coordinator-availability.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { GetAvailableSlotDto } from './dto/get-available-slot.dto';

@ApiTags('Examination Appointments')
@Controller('examination-appointments')
export class ExaminationAppointmentsController {
  constructor(
    private readonly coordinatorAvailabilityService: CoordinatorAvailabilityService,
  ) {}

  @Get('/available')
  @AllowAnonymous()
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
    return await this.coordinatorAvailabilityService.getAvailableSlots(
      new Date(dto.date),
    );
  }
}
