import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoordinatorAvailabilityService } from './coordinator-availability.service';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { GetCoordinatorAvailableSlotDto } from './dto/get-coordinator-available-slot.dto';

@ApiTags('Examination Appointments')
@Controller('examination-appointments')
export class ExaminationAppointmentsController {
  constructor(
    private readonly coordinatorAvailabilityService: CoordinatorAvailabilityService,
  ) {}

  @Get('/available')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get available appointment slots for a date' })
  @ApiOkResponse({ description: 'Available slots retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date or past date' })
  async getAvailableAppointments(@Query() dto: GetCoordinatorAvailableSlotDto) {
    return await this.coordinatorAvailabilityService.getAvailableSlots(
      new Date(dto.date),
    );
  }
}
