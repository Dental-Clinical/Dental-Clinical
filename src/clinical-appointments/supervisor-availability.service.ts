import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppointmentSlot } from 'src/coordinator-schedules/dto/appointment-slot.interface';
import { EntityManager, Not, Repository } from 'typeorm';
import { SlotGenerator } from '../utils/slot-generator';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulingValidation } from 'src/utils/scheduling-validation.utils';
import { AvailableSlot } from 'src/examination-appointments/dto/available-slot.interface';
import { SupervisorSchedule } from 'src/supervisor-schedules/supervisor-schedules.entity';
import { ClinicalAppointment } from './clinical-appointments.entity';
import { ClinicalAppointmentStatus } from './enums/clinical-appointment.enum';

@Injectable()
export class SupervisorAvailabilityService {
  constructor(
    @InjectRepository(SupervisorSchedule)
    private readonly scheduleRepository: Repository<SupervisorSchedule>,

    @InjectRepository(ClinicalAppointment)
    private readonly appointmentRepository: Repository<ClinicalAppointment>,
  ) {}
  public async getAvailableSlots(date: Date) {
    SchedulingValidation.validateDate(date);
    const day = SchedulingValidation.getDayOfWeek(date);

    const schedules = await this.loadSchedules(day);

    const booked = await this.loadBookedAppointment(date);

    const bookedByCoordinator = new Map<number, Set<string>>();
    for (const appointment of booked) {
      if (!bookedByCoordinator.has(appointment.supervisor.id)) {
        bookedByCoordinator.set(appointment.supervisor.id, new Set());
      }

      bookedByCoordinator
        .get(appointment.supervisor.id)!
        .add(`${appointment.appointmentStart}-${appointment.appointmentEnd}`);
    }
    const availableSlots: AvailableSlot[] = [];
    for (const schedule of schedules) {
      const generated = SlotGenerator.generateSlots(
        schedule.start_time,
        schedule.end_time,
        schedule.slot_duration,
      );

      const bookedSlots =
        bookedByCoordinator.get(schedule.supervisor_id) ?? new Set();

      const available = await this.removeBookedSlots(generated, bookedSlots);
      availableSlots.sort((a, b) => {
        if (a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }

        return a.coordinatorName.localeCompare(b.coordinatorName);
      });

      availableSlots.push(
        ...available.map((slot) => ({
          coordinatorId: schedule.supervisor_id,
          coordinatorName: schedule.supervisor.user.full_name,
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
      slots: SchedulingValidation.removePastSlots(availableSlots, date),
    };
  }
  public async validateSlotAvailability(
    date: Date,
    startTime: string,
    supervisorId: number,
    manager: EntityManager,
  ) {
    SchedulingValidation.validateDate(date);
    const day = SchedulingValidation.getDayOfWeek(date);
    let schedule: SupervisorSchedule | null = null;
    schedule = await manager.findOne(SupervisorSchedule, {
      where: {
        supervisor: { id: supervisorId },
        day_of_week: day,
        is_active: true,
      },
    });

    if (!schedule) {
      throw new HttpException(
        'No schedule found for the given supervisor on this day',
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
        'The requested slot is not valid for this supervisor',
      );
    }
    SchedulingValidation.validateFutureSlot(date, slot.startTime);
    const bookedAppointments = await manager.find(ClinicalAppointment, {
      where: {
        appointmentDate: date,
        appointmentStart: startTime,
        supervisor: { id: supervisorId },
        status: ClinicalAppointmentStatus.SCHEDULED,
      },
    });
    if (bookedAppointments.length > 0) {
      throw new HttpException(
        'The requested slot is already booked',
        HttpStatus.CONFLICT,
      );
    }

    return {
      supervisor: schedule.supervisor,
      appointmentDate: date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    };
  }
  private async loadSchedules(day: string) {
    return await this.scheduleRepository.find({
      where: { day_of_week: day, is_active: true },
      relations: {
        supervisor: {
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
        appointmentDate: date,
        status: ClinicalAppointmentStatus.SCHEDULED,
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
}
