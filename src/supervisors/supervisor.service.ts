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
import { DiagnosisSubmissionStatus } from 'src/diagnosis-submission/enums/diagnosis-submission-status.enum';
import { SupervisorScheduleService } from 'src/supervisor-schedules/supervisor-schedules.service';

@Injectable()
export class SupervisorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly whatsappService: WhatsappService,
    private readonly supervisorScheduleService: SupervisorScheduleService,
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

      const supervisorSchedules =
        await this.supervisorScheduleService.createSchedule(
          savedSupervisor,
          dto.schedules,
          manager,
        );
      return {
        supervisorId: savedSupervisor.id,
        tempPassword,
      };
    });
  }
  async getAssignedClinicalCases(user: AuthenticatedUser) {
    const supervisor = await this.findByUserId(user.userId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const clinicalCases = await this.dataSource
      .getRepository(ClinicalCase)
      .createQueryBuilder('clinical_case')
      .leftJoinAndSelect('clinical_case.patient', 'patient')
      .leftJoinAndSelect('clinical_case.assignedStudent', 'student')
      .leftJoinAndSelect('student.user', 'student_user')
      .leftJoinAndSelect(
        'clinical_case.diagnosisSubmission',
        'diagnosis_submission',
      )
      .leftJoinAndSelect(
        'clinical_case.plannedProcedures',
        'planned_procedures',
      )
      .leftJoinAndSelect(
        'planned_procedures.subjectProcedure',
        'subject_procedure',
      )
      .where('diagnosis_submission.supervisor_id = :supervisorId', {
        supervisorId: supervisor.id,
      })
      .andWhere('diagnosis_submission.status IN (:...statuses)', {
        statuses: [
          DiagnosisSubmissionStatus.PENDING_REVIEW,
          DiagnosisSubmissionStatus.APPROVED,
        ],
      })
      .getMany();

    const result = clinicalCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patientName: clinicalCase.patient.full_name,
        studentName: clinicalCase.assignedStudent.user.full_name,
        status: clinicalCase.status,
        procedures: clinicalCase.plannedProcedures.map((procedure) => ({
          id: procedure.id,
          name: procedure.subjectProcedure.name,
          tooth: procedure.toothNumber,
        })),
      };
    });
    return {
      cases: result,
    };
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
