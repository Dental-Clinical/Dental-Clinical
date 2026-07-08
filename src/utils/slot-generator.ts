import { AppointmentSlot } from 'src/coordinator-schedules/dto/appointment-slot.interface';
import { DateTimeUtils } from './date-time.utils';

export class SlotGenerator {
  static generateSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
  ): AppointmentSlot[] {
    const slots: AppointmentSlot[] = [];

    const current = DateTimeUtils.timeToMinutes(startTime);
    const end = DateTimeUtils.timeToMinutes(endTime);

    let cursor = current;

    while (cursor + slotDuration <= end) {
      slots.push({
        startTime: DateTimeUtils.minutesToTime(cursor),
        endTime: DateTimeUtils.minutesToTime(cursor + slotDuration),
      });

      cursor += slotDuration;
    }

    return slots;
  }
}
