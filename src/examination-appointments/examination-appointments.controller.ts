import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import { GetAvailableSlotDto } from './dto/get-available-slot.dto';

@Controller('examination-appointments')
export class ExaminationAppointmentsController {
  constructor(private readonly availabilityService: AvailabilityService) {}
  @Get('/available')
  @AllowAnonymous()
  async getAvailableAppointments(@Query() dto: GetAvailableSlotDto) {
    return await this.availabilityService.getAvailableSlots(new Date(dto.date));
  }
}
