import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExaminationAppointment } from './examination-appointment.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ExaminationAppointmentStatus } from 'src/examination-requests/Enums/examination-appointment.enum';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { Coordinator } from 'src/coordinators/coordinator.entity';

@Injectable()
export class ExaminationAppointmentsService {
  constructor(
    @InjectRepository(ExaminationAppointment)
    private readonly appointmentRepository: Repository<ExaminationAppointment>,
  ) {}
  async createAppointment(
    request: ExaminationRequest,
    coordinator: Coordinator,
    dto: CreateAppointmentDto,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(ExaminationAppointment)
      : this.appointmentRepository;
    const appointment = repository.create({
      examination_request: request,
      coordinator_id: coordinator.id,
      appointment_date: new Date(dto.appointmentDate),
      appointment_start: dto.appointmentStart,
      appointment_end: dto.appointmentEnd,
      status: ExaminationAppointmentStatus.SCHEDULED,
    });
    try {
      return repository.save(appointment);
    } catch (error) {
      throw new Error('Failed to create appointment');
    }
  }
  async cancelAppointment() {}
  async completeAppointment() {}
  async findByDate() {}
}
