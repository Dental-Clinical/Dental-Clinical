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
    @InjectRepository(ClinicalCase)
    readonly clinicalCaseRepository: Repository<ClinicalCase>,
    @InjectRepository(Student) readonly studentRepository: Repository<Student>,
    private readonly dataSource: DataSource,
    private readonly studentService: StudentService,
    private readonly supervisorAvailibilityService: SupervisorAvailabilityService,
  ) {}

  async createStudentClinicalAppointment(
    currentUser: AuthenticatedUser,
    dto: CreateStudentClinicalAppointmentDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const clinicalCase = await manager
        .getRepository(ClinicalCase)
        .createQueryBuilder('clinicalCase')
        .setLock('pessimistic_write')
        .where('clinicalCase.id = :id', { id: dto.clinicalCaseId })
        .getOne();

      const loadedCase = await manager.findOne(ClinicalCase, {
        where: { id: dto.clinicalCaseId },
        relations: {
          subject: { studyYear: true },
          patient: true,
        },
      });

      if (!loadedCase) {
        throw new NotFoundException('Clinical Case not Found');
      }

      if (loadedCase.status !== ClinicalCaseStatus.OPEN) {
        throw new ConflictException('Clinical Case is not open');
      }

      if (loadedCase.assignedStudent) {
        throw new ConflictException(
          'Clinical Case is already assigned to a student',
        );
      }

      if (loadedCase.assignedSupervisor) {
        throw new ConflictException(
          'Clinical Case is already assigned to a supervisor',
        );
      }

      const student = await this.studentService.findByUserId(
        currentUser.userId,
        manager,
      );

      if (!student) {
        throw new NotFoundException('Student not Found');
      }

      const studentCurrentYear = await this.studentService.getCurrentStudyYear(
        student.id,
        manager,
      );

      if (loadedCase.subject.studyYear.level !== studentCurrentYear.level) {
        throw new ForbiddenException(
          'Student is not in the same study year as the clinical case',
        );
      }

      const studentCurrentSection =
        await this.studentService.getStudentSectionForSubject(
          student.id,
          loadedCase.subject.id,
          manager,
        );

      const { patient } = loadedCase;
      const { supervisor } = studentCurrentSection.clinicSection;

      const { startTime, endTime } = await this.checkSupervisorAvailability(
        dto.appointmentDate,
        dto.appointmentStart,
        supervisor.id,
        manager,
      );

      const existingAppointment = await manager.findOne(ClinicalAppointment, {
        where: {
          clinicalCase: { id: loadedCase.id },
          status: ClinicalAppointmentStatus.SCHEDULED,
        },
      });
      if (existingAppointment) {
        throw new ConflictException('A clinical appointment already exists');
      }

      const clinicalAppointment = manager
        .getRepository(ClinicalAppointment)
        .create({
          clinicalCase: loadedCase,
          student,
          patient,
          supervisor,
          appointmentDate: dto.appointmentDate,
          appointmentStart: startTime,
          appointmentEnd: endTime,
          status: ClinicalAppointmentStatus.SCHEDULED,
        });

      loadedCase.assignedStudent = student;
      loadedCase.assignedSupervisor = supervisor;
      loadedCase.status = ClinicalCaseStatus.ASSIGNED;

      await manager.save(loadedCase);

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
  async getAvailableSlots(
    currentUser: AuthenticatedUser,
    date: Date,
    clinicalCaseId: number,
  ) {
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id: clinicalCaseId },
      relations: {
        subject: true,
      },
    });
    if (!clinicalCase) {
      throw new NotFoundException('Clinical case not found');
    }
    if (
      ![
        ClinicalCaseStatus.OPEN,
        ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
      ].includes(clinicalCase.status)
    ) {
      throw new ConflictException('This clinical case cannot be scheduled.');
    }

    if (clinicalCase.assignedStudent) {
      throw new ConflictException('Clinical case has already been assigned');
    }

    const studentSection =
      await this.studentService.getStudentSectionForSubject(
        currentUser.userId,
        clinicalCase.subject.id,
      );

    return await this.supervisorAvailibilityService.getAvailableSlots(
      date,
      studentSection.clinicSection.supervisor.id,
    );
  }
  async getTodayAppointments(currentUser: AuthenticatedUser) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await this.clinicalAppointmentRepository.find({
      where: {
        student: { user: { id: currentUser.userId } },
        appointmentDate: today,
        status: ClinicalAppointmentStatus.SCHEDULED,
      },
      relations: {
        clinicalCase: true,
        patient: true,
        supervisor: true,
      },
    });

    if (appointments.length === 0) {
      throw new NotFoundException('No appointments found for today');
    }
    const now = new Date();
    return appointments.map((appointment) => {
      const start = this.combineDateAndTime(
        appointment.appointmentDate,
        appointment.appointmentStart,
      );
      const end = this.combineDateAndTime(
        appointment.appointmentDate,
        appointment.appointmentEnd,
      );
      let displayStatus: string;

      if (appointment.status === ClinicalAppointmentStatus.CANCELLED) {
        displayStatus = 'Cancelled';
      } else if (appointment.status === ClinicalAppointmentStatus.NO_SHOW) {
        displayStatus = 'No Show';
      } else if (now < start) {
        displayStatus = 'Upcoming';
      } else if (now >= start && now < end) {
        displayStatus = 'Ongoing';
      } else {
        displayStatus = 'Completed';
      }

      return {
        appointmentId: appointment.id,
        patient: appointment.patient.full_name,
        start: new Date(start).toLocaleTimeString(),
        displayStatus,
      };
    });
  }
  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours, minutes, 0, 0);
    return combinedDateTime;
  }

  async noShowAppointment(id: number, user: AuthenticatedUser) {
    const isStudent = user.role === UserRole.STUDENT;
    if (!isStudent && user.role !== UserRole.SUPERVISOR) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }

    const appointment = await this.clinicalAppointmentRepository.findOne({
      where: { id },
      relations: isStudent ? { student: { user: true } } : {},
    });

    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }

    if (isStudent && appointment.student?.user?.id !== user.userId) {
      throw new ForbiddenException(
        'You are not the student of this appointment',
      );
    }

    await this.clinicalAppointmentRepository.update(id, {
      status: ClinicalAppointmentStatus.NO_SHOW,
    });

    appointment.status = ClinicalAppointmentStatus.NO_SHOW;
    return appointment;
  }

  async cancelAppointment(id: number, user: AuthenticatedUser) {
    const isStudent = user.role === UserRole.STUDENT;
    const isSupervisor = user.role === UserRole.SUPERVISOR;
    const isPatient = user.role === UserRole.PATIENT;
    if (!isStudent && !isSupervisor && !isPatient) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }

    const appointment = await this.clinicalAppointmentRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        supervisor: { user: true },
        patient: { user: true },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }

    const ownerId = isStudent
      ? appointment.student?.user?.id
      : isSupervisor
        ? appointment.supervisor?.user?.id
        : appointment.patient?.user?.id;

    if (ownerId !== user.userId) {
      throw new ForbiddenException('This appointment does not belong to you');
    }

    if (appointment.status !== ClinicalAppointmentStatus.SCHEDULED) {
      throw new ConflictException(
        'Only scheduled appointments can be cancelled',
      );
    }

    await this.clinicalAppointmentRepository.update(id, {
      status: ClinicalAppointmentStatus.CANCELLED,
    });

    appointment.status = ClinicalAppointmentStatus.CANCELLED;
    return appointment;
  }
}
