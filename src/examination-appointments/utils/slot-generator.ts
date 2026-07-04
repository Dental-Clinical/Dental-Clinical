import { AppointmentSlot } from 'src/coordinator-schedules/dto/appointment-slot.interface';

export class SlotGenerator {
  static generateSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
  ): AppointmentSlot[] {
    const slots: AppointmentSlot[] = [];

    const current = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    let cursor = current;

    while (cursor + slotDuration <= end) {
      slots.push({
        startTime: this.minutesToTime(cursor),
        endTime: this.minutesToTime(cursor + slotDuration),
      });

      cursor += slotDuration;
    }

    return slots;
  }
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}
