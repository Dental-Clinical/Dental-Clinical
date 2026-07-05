import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { PasswordService } from 'src/common/services/password.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { randomBytes } from 'crypto';
import { UserRole } from 'src/constants/user-roles';
import { Coordinator } from './coordinator.entity';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ExaminationAppointment } from 'src/examination-appointments/examination-appointment.entity';
import { ExaminationAppointmentStatus } from 'src/examination-requests/Enums/examination-appointment.enum';
import { CoordinatorAppointmentResponseDto } from './dto/today-appointments-response.dto';

@Injectable()
export class CoordinatorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly whatsappService: WhatsappService,
    @InjectRepository(Coordinator)
    private readonly coordinatorRepository: Repository<Coordinator>,
    @InjectRepository(ExaminationAppointment)
    private readonly examinationAppointmentRepository: Repository<ExaminationAppointment>,
  ) {}
  async createCoordinator(dto: CreateCoordinatorDto) {
    return await this.dataSource.transaction(async (manager) => {
      dto.email = dto.email.trim().toLowerCase();
      dto.phone = dto.phone.replace(/\D/g, '');

      const existingUser = await manager.getRepository(User).findOne({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      const tempPassword = randomBytes(8).toString('hex');

      const passwordHash = await this.passwordService.hash(tempPassword);

      const user = manager.getRepository(User).create({
        full_name: dto.full_name,
        father_name: dto.father_name,
        role: UserRole.COORDINATOR,
        email: dto.email,
        phone: dto.phone,
        password_hash: passwordHash,
      });
      // this.whatsappService.sendPassword(tempPassword, dto.phone);
      console.log(tempPassword);

      const savedUser = await manager.save(user);

      const newCoordinator = manager.getRepository(Coordinator).create({
        user: savedUser,
      });
      const savedCoordinator = await manager.save(newCoordinator);
      return {
        coordinatorId: savedCoordinator.id,
      };
    });
  }
  async findByUserId(userId: number) {
    return await this.coordinatorRepository.findOne({
      where: { user: { id: userId } },
    });
  }
  async getTodayAppointmentsForCoordinator(userId: number) {
    const coordinator = await this.getAuthenticatedCoordinator(userId);

    const { today, tomorrow } = this.getTodayRange();

    const appointments = await this.createCoordinatorAppointmentQuery(
      coordinator.id,
    )
      .andWhere('appointment.appointment_date >= :today', { today })
      .andWhere('appointment.appointment_date < :tomorrow', { tomorrow })
      .andWhere('appointment.status = :status', {
        status: ExaminationAppointmentStatus.SCHEDULED,
      })
      .orderBy('appointment.appointment_start', 'ASC')
      .getMany();

    return {
      message: "Today's appointments retrieved successfully",
      data: appointments,
    };
  }
  async getUpcomingAppointmentsForCoordinator(userId: number) {
    const coordinator = await this.getAuthenticatedCoordinator(userId);
    const { today } = this.getTodayRange();

    const appointments = await this.createCoordinatorAppointmentQuery(
      coordinator.id,
    )
      .andWhere('appointment.appointment_date >= :today', { today })
      .leftJoin('appointment.examination_request', 'request')
      .leftJoin('request.patient', 'patient')
      .select([
        'appointment.id',
        'appointment.appointment_date',
        'appointment.appointment_start',
        'request.chief_complaint',
        'patient.full_name',
      ])
      .getMany();

    const response: CoordinatorAppointmentResponseDto[] = appointments.map(
      (appointment) => ({
        appointmentId: appointment.id,
        appointmentDate: appointment.appointment_date,
        appointmentStart: appointment.appointment_start,
        chiefComplaint: appointment.examination_request.chief_complaint,
        patientName: appointment.examination_request.patient.full_name,
      }),
    );
    return {
      message: 'Upcoming appointments retrieved successfully',
      data: response,
    };
  }
  async getAppointmentDetails(appointmentId: number, userId: number) {
    const coordinator = await this.getAuthenticatedCoordinator(userId);

    const appointment = await this.createCoordinatorAppointmentQuery(
      coordinator.id,
    )
      .leftJoinAndSelect('appointment.examination_request', 'request')
      .leftJoinAndSelect('request.patient', 'patient')
      .andWhere('appointment.id = :appointmentId', { appointmentId })
      .getOne();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      message: 'Appointment details retrieved successfully',
      data: {
        appointmentId: appointment.id,
        appointmentDate: appointment.appointment_date,
        appointmentStart: appointment.appointment_start,
        chiefComplaint: appointment.examination_request.chief_complaint,
        patientName: appointment.examination_request.patient.full_name,
      },
    };
  }
  private createCoordinatorAppointmentQuery(coordinatorId: number) {
    return this.examinationAppointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.coordinator_id = :coordinatorId', {
        coordinatorId,
      })
      .andWhere('appointment.status = :status', {
        status: ExaminationAppointmentStatus.SCHEDULED,
      });
  }
  private getTodayRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return { today, tomorrow };
  }
  private async getAuthenticatedCoordinator(
    userId: number,
  ): Promise<Coordinator> {
    const coordinator = await this.findByUserId(userId);

    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    return coordinator;
  }
}
