import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupervisorScheduleDto } from './dto/create-supervisor-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SupervisorSchedule } from './supervisor-schedules.entity';
import { EntityManager, Repository } from 'typeorm';
import { DayOfWeek } from 'src/constants/day-of-week';
import { UpdateSupervisorScheduleDto } from './dto/update-supervisor-schedule.dto';
import { SupervisorService } from 'src/supervisors/supervisor.service';
import { GetSupervisorScheduleResponseDto } from './dto/supervisor-schedule-response.dto';
import { Supervisor } from 'src/supervisors/supervisor.entity';

@Injectable()
export class SupervisorScheduleService {
  private readonly MAX_WORKING_MINUTES = 12 * 60;
  constructor(
    @InjectRepository(SupervisorSchedule)
    private readonly supervisorScheduleRepository: Repository<SupervisorSchedule>,
    @Inject(forwardRef(() => SupervisorService))
    private readonly supervisorService: SupervisorService,
  ) {}
  async createSchedule(
    supervisor: Supervisor,
    dto: CreateSupervisorScheduleDto[],
    manager: EntityManager,
  ) {
    for (const scheduleDto of dto) {
      scheduleDto.day_of_week = scheduleDto.day_of_week.toLowerCase();

      if (!supervisor) {
        throw new NotFoundException('Supervisor not found');
      }

      const schedule = this.supervisorScheduleRepository.create({
        ...scheduleDto,
        supervisor,
      });

      await this.validateSchedule(supervisor.id, schedule);

      try {
        const savedSchedule = await manager
          .getRepository(SupervisorSchedule)
          .save(schedule);
      } catch (error: any) {
        if (error.code === '23505') {
          throw new ConflictException('Schedule already exists');
        }
        throw error;
      }
    }
  }
  async getMySchedule(userId: number) {
    const supervisor = await this.supervisorService.findByUserId(userId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }
    const schedules = await this.supervisorScheduleRepository.find({
      where: {
        supervisor: {
          id: supervisor.id,
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
      schedule: {
        workingDays: schedules.map((schedule) => ({
          id: schedule.id,
          day: schedule.day_of_week,
          workingHours: schedule.start_time + ' - ' + schedule.end_time,
          isActive: schedule.is_active,
        })),
      },
    };
  }
  async updateSchedule(dto: UpdateSupervisorScheduleDto, scheduleId: number) {
    const schedule = await this.supervisorScheduleRepository.findOne({
      where: {
        id: scheduleId,
      },
      relations: {
        supervisor: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const supervisor = schedule.supervisor;

    Object.assign(schedule, dto);

    await this.validateSchedule(supervisor.id, schedule, scheduleId);

    try {
      const updatedSchedule =
        await this.supervisorScheduleRepository.save(schedule);
      return {
        message: 'Supervisor schedule updated successfully',
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
    const supervisor = await this.supervisorService.findByUserId(userId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const schedule = await this.supervisorScheduleRepository.findOne({
      where: {
        id: scheduleId,
        supervisor: { id: supervisor.id },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    try {
      await this.supervisorScheduleRepository.remove(schedule);
      return {
        message: 'Supervisor schedule deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete schedule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async validateSchedule(
    supervisorId: number,
    schedule: SupervisorSchedule,
    excludeScheduleId?: number,
    manager?: EntityManager,
  ) {
    const duration = this.calculateDuration(
      schedule.start_time,
      schedule.end_time,
    );

    if (duration <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    if (duration > this.MAX_WORKING_MINUTES) {
      throw new BadRequestException('Working period cannot exceed 12 hours');
    }
    const query = manager
      ? manager.getRepository(SupervisorSchedule).createQueryBuilder('schedule')
      : this.supervisorScheduleRepository
          .createQueryBuilder('schedule')
          .where('schedule.supervisor_id = :supervisorId', {
            supervisorId,
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
  async getSchedulesByDay(day: string): Promise<SupervisorSchedule[]> {
    return this.supervisorScheduleRepository.find({
      where: { day_of_week: day, is_active: true },
      relations: {
        supervisor: true,
      },
    });
  }
  async getAllSchedules() {
    const schedules = await this.supervisorScheduleRepository.find({
      relations: {
        supervisor: { user: true },
      },
    });
    return schedules.map((schedule) => ({
      id: schedule.id,
      supervisor: {
        id: schedule.supervisor.id,
        full_name: schedule.supervisor.user.full_name,
      },
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_active: schedule.is_active,
    }));
  }
  async getScheduleById(scheduleId: number) {
    const schedule = await this.supervisorScheduleRepository.findOne({
      where: { id: scheduleId },
      relations: {
        supervisor: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return {
      message: 'Supervisor schedule retrieved successfully',
      schedule: {
        id: schedule.id,
        supervisor_id: schedule.supervisor.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active,
      },
    };
  }
}
