import { BadRequestException } from '@nestjs/common';
import { AppointmentSlot } from 'src/coordinator-schedules/dto/appointment-slot.interface';

export class SchedulingValidation {
  static validateDate(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new BadRequestException(
        'Cannot get available slots for past dates',
      );
    }
    return true;
  }
  static removePastSlots(slots: AppointmentSlot[], date: Date) {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return slots.filter((slot) => {
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate > now;
      });
    }

    return slots;
  }
  static validateFutureSlot(appointmentDate: Date, startTime: string): void {
    const now = new Date();

    const slotDate = new Date(appointmentDate);

    const [hours, minutes] = startTime.split(':').map(Number);

    slotDate.setHours(hours, minutes, 0, 0);

    if (slotDate <= now) {
      throw new BadRequestException(
        'The selected appointment slot has already passed.',
      );
    }
  }
  static getDayOfWeek(date: Date): string {
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    date = new Date(date);

    return daysOfWeek[date.getDay()];
  }
}
