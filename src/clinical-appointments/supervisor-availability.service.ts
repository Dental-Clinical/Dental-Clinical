import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
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
  public async getAvailableSlots(date: Date, supervisorId: number) {
    SchedulingValidation.validateDate(date);

    const day = SchedulingValidation.getDayOfWeek(date);

    const schedule = await this.scheduleRepository.findOne({
      where: {
        supervisor: {
          id: supervisorId,
        },
        day_of_week: day,
        is_active: true,
      },
      relations: {
        supervisor: {
          user: true,
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Supervisor is not available on this day');
    }

    const slots = SlotGenerator.generateFixedDurationSlots(
      schedule.start_time,
      schedule.end_time,
      120,
    );

    return {
      supervisor: schedule.supervisor.user.full_name,
      appointmentDate: date,
      slots: SchedulingValidation.removePastSlots(slots, date),
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
    SchedulingValidation.validateFutureSlot(date, startTime);

    const endTime = SchedulingValidation.calculateAppointmentEndTime(
      startTime,
      120,
    );

    SchedulingValidation.validateWithinSchedule(
      startTime,
      endTime,
      schedule.start_time,
      schedule.end_time,
    );

    return {
      supervisor: schedule.supervisor,
      appointmentDate: date,
      startTime,
      endTime,
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
