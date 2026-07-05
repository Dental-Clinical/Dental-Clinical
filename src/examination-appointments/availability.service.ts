import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppointmentSlot } from 'src/coordinator-schedules/dto/appointment-slot.interface';
import { EntityManager, Not, Repository } from 'typeorm';
import { SlotGenerator } from './utils/slot-generator';
import { InjectRepository } from '@nestjs/typeorm';
import { CoordinatorSchedule } from 'src/coordinator-schedules/coordniator-schedule.entity';
import { ExaminationAppointment } from 'src/examination-appointments/examination-appointment.entity';
import { ExaminationAppointmentStatus } from 'src/examination-requests/Enums/examination-appointment.enum';
import type { AvailableSlot } from './dto/available-slot.interface';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(CoordinatorSchedule)
    private readonly scheduleRepository: Repository<CoordinatorSchedule>,

    @InjectRepository(ExaminationAppointment)
    private readonly appointmentRepository: Repository<ExaminationAppointment>,
  ) {}
  public async getAvailableSlots(date: Date) {
    this.validateDate(date);
    const day = this.getDayOfWeek(date);

    const schedules = await this.loadSchedules(day);

    const booked = await this.loadBookedAppointment(date);

    const bookedByCoordinator = new Map<number, Set<string>>();
    for (const appointment of booked) {
      if (!bookedByCoordinator.has(appointment.coordinator_id!)) {
        bookedByCoordinator.set(appointment.coordinator_id!, new Set());
      }

      bookedByCoordinator
        .get(appointment.coordinator_id!)!
        .add(`${appointment.appointment_start}-${appointment.appointment_end}`);
    }
    const availableSlots: AvailableSlot[] = [];
    for (const schedule of schedules) {
      const generated = SlotGenerator.generateSlots(
        schedule.start_time,
        schedule.end_time,
        schedule.slot_duration,
      );

      const bookedSlots =
        bookedByCoordinator.get(schedule.coordinator.id) ?? new Set();

      const available = await this.removeBookedSlots(generated, bookedSlots);
      availableSlots.sort((a, b) => {
        if (a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }

        return a.coordinatorName.localeCompare(b.coordinatorName);
      });

      availableSlots.push(
        ...available.map((slot) => ({
          coordinatorId: schedule.coordinator.id,
          coordinatorName: schedule.coordinator.user.full_name,
          appointmentDate: date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      );
    }
    // return availableSlots;
    return {
      message: availableSlots.length
        ? 'Available slots retrieved successfully'
        : 'No available slots for the given date',
      slots: this.removePastSlots(availableSlots, date),
    };
  }
  public async validateSlotAvailability(
    date: Date,
    startTime: string,
    coordinatorId: number,
    manager: EntityManager,
  ) {
    this.validateDate(date);
    const day = this.getDayOfWeek(date);
    let schedule: CoordinatorSchedule | null = null;
    schedule = await manager.findOne(CoordinatorSchedule, {
      where: {
        coordinator: { id: coordinatorId },
        day_of_week: day,
        is_active: true,
      },
    });

    if (!schedule) {
      throw new HttpException(
        'No schedule found for the given coordinator on this day',
        HttpStatus.NOT_FOUND,
      );
    }
    const generatedSlots = SlotGenerator.generateSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration,
    );
    const slot = generatedSlots.find((slot) => slot.startTime === startTime);
    if (!slot) {
      throw new BadRequestException(
        'The requested slot is not valid for this coordinator',
      );
    }
    this.validateFutureSlot(date, slot.startTime);
    const bookedAppointments = await manager.find(ExaminationAppointment, {
      where: {
        appointment_date: date,
        appointment_start: startTime,
        coordinator_id: coordinatorId,
        status: ExaminationAppointmentStatus.SCHEDULED,
      },
    });
    if (bookedAppointments.length > 0) {
      throw new HttpException(
        'The requested slot is already booked',
        HttpStatus.CONFLICT,
      );
    }

    return {
      coordinator: schedule.coordinator,
      appointmentDate: date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    };
  }
  private async loadSchedules(day: string) {
    return await this.scheduleRepository.find({
      where: { day_of_week: day, is_active: true },
      relations: {
        coordinator: {
          user: true,
        },
      },
      order: {
        start_time: 'ASC',
      },
    });
  }
  private async loadBookedAppointment(date: Date) {
    return await this.appointmentRepository.find({
      where: {
        appointment_date: date,
        status: ExaminationAppointmentStatus.SCHEDULED,
      },
    });
  }
  private async removeBookedSlots(
    slots: AppointmentSlot[],
    bookedSlots: Set<string>,
  ) {
    return slots.filter(
      (slot) => !bookedSlots.has(`${slot.startTime}-${slot.endTime}`),
    );
  }
  private removePastSlots(slots: AppointmentSlot[], date: Date) {
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
  private getDayOfWeek(date: Date): string {
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
  private validateDate(date: Date) {
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
  private validateFutureSlot(appointmentDate: Date, startTime: string): void {
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
}
