import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoordinatorScheduleDto } from './dto/create-coordinator-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CoordinatorSchedule } from './coordniator-schedule.entity';
import { Repository } from 'typeorm';
import { CoordinatorService } from 'src/coordinators/coordinator.service';
import { DayOfWeek } from 'src/constants/day-of-week';
import type { AppointmentSlot } from './dto/appointment-slot.interface';
import { UpdateCoordinatorScheduleDto } from './dto/update-coordinator-schedule.dto';

@Injectable()
export class CoordinatorScheduleService {
  private readonly MAX_WORKING_MINUTES = 12 * 60;
  constructor(
    @InjectRepository(CoordinatorSchedule)
    private readonly coordinatorScheduleRepository: Repository<CoordinatorSchedule>,
    private readonly coordinatorService: CoordinatorService,
  ) {}
  async createSchedule(userId: number, dto: CreateCoordinatorScheduleDto) {
    dto.day_of_week = dto.day_of_week.toLowerCase();
    const allowedDurations = [15, 20, 30, 45, 60];
    if (!allowedDurations.includes(dto.slot_duration)) {
      throw new BadRequestException(`Invalid slot duration`);
    }

    const coordinator = await this.coordinatorService.findByUserId(userId);
    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const schedule = this.coordinatorScheduleRepository.create({
      ...dto,
      coordinator,
    });

    await this.validateSchedule(coordinator.id, schedule);

    try {
      const savedSchedule =
        await this.coordinatorScheduleRepository.save(schedule);
      return {
        message: 'Coordinator schedule created successfully',
        data: savedSchedule,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Schedule already exists');
      }
      throw error;
    }
  }
  async getMySchedule(userId: number) {
    const coordinator = await this.coordinatorService.findByUserId(userId);
    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }
    const schedules = await this.coordinatorScheduleRepository.find({
      where: {
        coordinator: {
          id: coordinator.id,
        },
      },
      order: {
        day_of_week: 'ASC',
      },
    });
    const dayOrder: Record<DayOfWeek, number> = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
    };

    schedules.sort((a, b) => dayOrder[a.day_of_week] - dayOrder[b.day_of_week]);
    return {
      message: 'Coordinator schedules retrieved successfully',
      data: {
        workingDays: schedules.map((schedule) => ({
          day: schedule.day_of_week,
          workingHours: schedule.start_time + ' - ' + schedule.end_time,
          slotDuration: schedule.slot_duration,
          isActive: schedule.is_active,
        })),
      },
    };
  }
  async updateSchedule(
    userId: number,
    dto: UpdateCoordinatorScheduleDto,
    scheduleId: number,
  ) {
    const coordinator = await this.coordinatorService.findByUserId(userId);
    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const schedule = await this.coordinatorScheduleRepository.findOne({
      where: {
        id: scheduleId,
        coordinator: { id: coordinator.id },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    Object.assign(schedule, dto);

    await this.validateSchedule(coordinator.id, schedule, scheduleId);

    try {
      const updatedSchedule =
        await this.coordinatorScheduleRepository.save(schedule);
      return {
        message: 'Coordinator schedule updated successfully',
        data: updatedSchedule,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Schedule already exists');
      }
      throw error;
    }
  }
  async deleteSchedule(userId: number, scheduleId: number) {
    const coordinator = await this.coordinatorService.findByUserId(userId);
    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const schedule = await this.coordinatorScheduleRepository.findOne({
      where: {
        id: scheduleId,
        coordinator: { id: coordinator.id },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    try {
      await this.coordinatorScheduleRepository.remove(schedule);
      return {
        message: 'Coordinator schedule deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete schedule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async validateSchedule(
    coordinatorId: number,
    schedule: CoordinatorSchedule,
    excludeScheduleId?: number,
  ) {
    const duration = this.calculateDuration(
      schedule.start_time,
      schedule.end_time,
    );

    if (duration <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    if (duration < schedule.slot_duration) {
      throw new BadRequestException(
        'Working period is shorter than slot duration',
      );
    }

    if (duration % schedule.slot_duration !== 0) {
      throw new BadRequestException(
        'Slot duration must divide the working hours exactly',
      );
    }

    if (duration > this.MAX_WORKING_MINUTES) {
      throw new BadRequestException('Working period cannot exceed 12 hours');
    }
    const query = this.coordinatorScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.coordinator_id = :coordinatorId', {
        coordinatorId,
      })
      .andWhere('schedule.day_of_week = :day', {
        day: schedule.day_of_week,
      });

    if (excludeScheduleId) {
      query.andWhere('schedule.id != :scheduleId', {
        scheduleId: excludeScheduleId,
      });
    }

    const existingSchedule = await query.getOne();

    if (existingSchedule) {
      throw new ConflictException('Schedule for this day already exists');
    }
  }
  private calculateDuration(start_time: string, end_time: string) {
    const [startHours, startMinutes] = start_time.split(':').map(Number);
    const [endHours, endMinutes] = end_time.split(':').map(Number);

    const startDate = new Date(0, 0, 0, startHours, startMinutes);
    const endDate = new Date(0, 0, 0, endHours, endMinutes);

    const durationInMilliseconds = endDate.getTime() - startDate.getTime();
    return durationInMilliseconds / (1000 * 60); // Convert to minutes
  }
  async getSchedulesByDay(day: string): Promise<CoordinatorSchedule[]> {
    return this.coordinatorScheduleRepository.find({
      where: { day_of_week: day, is_active: true },
      relations: {
        coordinator: true,
      },
    });
  }
}
