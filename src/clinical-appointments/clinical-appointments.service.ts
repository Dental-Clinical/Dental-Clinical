import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalAppointment } from './clinical-appointments.entity';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { CreateStudentClinicalAppointmentDto } from './dto/create-student-clinical-appointment.dto';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { Student } from 'src/students/student.entity';
import { Patient } from 'src/patients/patient.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
import { InitialExaminationStatus } from 'src/initial-examination/enums/initial-examination-status.enum';
import { ClinicalAppointmentStatus } from './enums/clinical-appointment.enum';
import { SupervisorAvailabilityService } from './supervisor-availability.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UserRole } from 'src/constants/user-roles';
import { UpdateStudentClinicalAppointmentDto } from './dto/update-student-clinical-appointment.dto';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { StudentService } from 'src/students/student.service';
import { SupervisorService } from 'src/supervisors/supervisor.service';

@Injectable()
export class ClinicalAppointmentsService {
  constructor(
    @InjectRepository(ClinicalAppointment)
    readonly clinicalAppointmentRepository: Repository<ClinicalAppointment>,
    private readonly dataSource: DataSource,
    private readonly studentService: StudentService,
    private readonly supervisorAvailibilityService: SupervisorAvailabilityService,
  ) {}

  async createStudentClinicalAppointment(
    currentUser: AuthenticatedUser,
    dto: CreateStudentClinicalAppointmentDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const supervisor = await manager.findOne(Supervisor, {
        where: { id: dto.supervisorId, user: { is_active: true } },
      });

      if (!supervisor) {
        throw new NotFoundException('Supervisor not Found');
      }
      const clinicalCase = await manager
        .getRepository(ClinicalCase)
        .createQueryBuilder('clinicalCase')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('clinicalCase.subject', 'subject')
        .leftJoinAndSelect('subject.studyYear', 'studyYear')
        .leftJoinAndSelect('clinicalCase.patient', 'patient')
        .where('clinicalCase.id = :id', { id: dto.clinicalCaseId })
        .getOne();

      if (!clinicalCase) {
        throw new NotFoundException('Clinical Case not Found');
      }

      if (clinicalCase.status !== ClinicalCaseStatus.OPEN) {
        throw new ConflictException('Clinical Case is not open');
      }

      if (clinicalCase.assignedStudent) {
        throw new ConflictException(
          'Clinical Case is already assigned to a student',
        );
      }

      const student = await manager.findOne(Student, {
        where: { user: { id: currentUser.userId } },
      });

      if (!student) {
        throw new NotFoundException('Student not Found');
      }

      const studentCurrentYear = await this.studentService.getCurrentStudyYear(
        student.id,
      );

      if (clinicalCase.subject.studyYear.level !== studentCurrentYear.level) {
        throw new ForbiddenException(
          'Student is not in the same study year as the clinical case',
        );
      }

      const patient = clinicalCase.patient;

      const { startTime, endTime } = await this.checkSupervisorAvailability(
        dto.appointment_date,
        dto.appointment_start,
        supervisor.id,
        manager,
      );

      const existingAppointment = await manager.findOne(ClinicalAppointment, {
        where: {
          clinicalCase: { id: clinicalCase.id },
          status: ClinicalAppointmentStatus.SCHEDULED,
        },
      });
      if (existingAppointment) {
        throw new ConflictException('A clinical appointment already exists');
      }

      const clinicalAppointment = manager
        .getRepository(ClinicalAppointment)
        .create({
          clinicalCase,
          student,
          patient,
          supervisor,
          appointmentDate: dto.appointment_date,
          appointmentStart: startTime,
          appointmentEnd: endTime,
          status: ClinicalAppointmentStatus.SCHEDULED,
        });

      clinicalCase.assignedStudent = student;
      clinicalCase.status = ClinicalCaseStatus.ASSIGNED;
      await manager.save(clinicalCase);

      return manager.save(clinicalAppointment);
    });
  }

  private async checkSupervisorAvailability(
    date: Date,
    time: string,
    supervisorId: number,
    manager: EntityManager,
  ) {
    const availableSlot =
      await this.supervisorAvailibilityService.validateSlotAvailability(
        date,
        time,
        supervisorId,
        manager,
      );

    return availableSlot;
  }

  async updateAppointment(
    id: number,
    user: AuthenticatedUser,
    dto: UpdateStudentClinicalAppointmentDto,
  ) {
    const appointment = await this.clinicalAppointmentRepository.findOneBy({
      id,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }
    if (
      user.role === UserRole.STUDENT &&
      appointment.student.user.id !== user.userId
    ) {
      throw new ForbiddenException("Appointment isn't for this user");
    }
    if (
      user.role === UserRole.PATIENT &&
      appointment.patient.user?.id !== user.userId
    ) {
      throw new ForbiddenException("Appointment isn't for this patient");
    }
    return await this.clinicalAppointmentRepository.update(id, dto);
  }
}
