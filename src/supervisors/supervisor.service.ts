import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UserService } from 'src/users/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Supervisor } from './supervisor.entity';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from 'src/common/services/password.service';
import { User } from 'src/users/user.entity';
import { randomBytes } from 'crypto';
import { UserRole } from 'src/constants/user-roles';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';

@Injectable()
export class SupervisorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly whatsappService: WhatsappService,
  ) {}
  async getSupervisors() {
    const supervisors = await this.dataSource.getRepository(Supervisor).find({
      relations: {
        user: true,
      },
    });
    return supervisors.map((supervisor) => ({
      id: supervisor.id,
      full_name: supervisor.user.full_name,
    }));
  }
  async createSupervisor(dto: CreateSupervisorDto) {
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
        role: UserRole.SUPERVISOR,
        email: dto.email,
        phone: dto.phone,
        password_hash: passwordHash,
      });

      // this.whatsappService.sendPassword(tempPassword, dto.phone);
      console.log(tempPassword);

      const savedUser = await manager.save(user);

      const newSupervisor = manager.getRepository(Supervisor).create({
        user: savedUser,
      });
      const savedSupervisor = await manager.save(newSupervisor);
      return {
        supervisorId: savedSupervisor.id,
        tempPassword,
      };
    });
  }
  async getClinicalCasesPendingReview(userId: number) {
    const supervisor = await this.findByUserId(userId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }
    const clinicalCases = await this.dataSource
      .getRepository(ClinicalCase)
      .find({
        where: {
          assignedSupervisor: { id: supervisor.id },
          status: ClinicalCaseStatus.PENDING_SUPERVISOR_APPROVAL,
        },
        relations: {
          assignedStudent: { user: true },
          patient: true,
          subject: true,
          clinicalAppointments: true,
          plannedProcedures: true,
        },
      });
    return clinicalCases.map((clinicalCase) => {
      const nextScheduledAppointment = clinicalCase.clinicalAppointments
        .filter(
          (appointment) =>
            appointment.status === ClinicalAppointmentStatus.SCHEDULED,
        )
        .sort(
          (a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime(),
        )[0];
      return {
        id: clinicalCase.id,
        patientName: clinicalCase.patient.full_name,
        subjectName: clinicalCase.subject.name,
        studentName: clinicalCase.assignedStudent?.user.full_name || null,
        nextScheduledAppointment,
        procedureCount: clinicalCase.plannedProcedures.length,
      };
    });
  }
  async findByUserId(userId: number) {
    return await this.dataSource.getRepository(Supervisor).findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        schedules: true,
      },
    });
  }
  async findById(id: number) {
    return await this.dataSource.getRepository(Supervisor).findOne({
      where: { id, user: { is_active: true } },
      relations: {
        user: true,
        schedules: true,
      },
    });
  }
}
