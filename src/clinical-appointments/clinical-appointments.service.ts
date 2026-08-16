import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalAppointment } from './clinical-appointments.entity';
import {
  DataSource,
  EntityManager,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
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
import { StudentUpcomingAppointmentDto } from './dto/clinical-appointment-response.dto';
import { UpdateAppointmentScheduleDto } from './dto/update-appointment-schedule.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { FCMChannels } from 'src/fcm-tokens/enums/notification-channels.enum';
import { PushPayload } from 'src/fcm-tokens/interfaces/push-payload.interface';

@Injectable()
export class ClinicalAppointmentsService {
  private readonly logger = new Logger(ClinicalAppointmentsService.name);

  constructor(
    @InjectRepository(ClinicalAppointment)
    readonly clinicalAppointmentRepository: Repository<ClinicalAppointment>,
    @InjectRepository(ClinicalCase)
    readonly clinicalCaseRepository: Repository<ClinicalCase>,
    @InjectRepository(Student) readonly studentRepository: Repository<Student>,
    private readonly dataSource: DataSource,
    private readonly studentService: StudentService,
    private readonly supervisorAvailibilityService: SupervisorAvailabilityService,
    @InjectRepository(Patient) readonly patientRepository: Repository<Patient>,
    private readonly notificationsService: NotificationsService,
  ) { }

  /**
   * Fans a notification out to the parties that did not perform the action.
   *
   * Always called after the surrounding work has committed, so a failure here
   * is logged rather than thrown: a lost notification must never turn a
   * successful booking into an error for the caller. Undefined ids are dropped
   * because walk-in patients have no user account to notify.
   */
  private async notifyParties(
    userIds: (number | undefined)[],
    payload: PushPayload,
    type: NotificationType,
  ) {
    const recipients = [...new Set(userIds)].filter(
      (id): id is number => id !== undefined && id !== null,
    );

    if (!recipients.length) {
      return;
    }

    try {
      await this.notificationsService.notifyUsers(
        recipients,
        payload,
        type,
        FCMChannels.APPOINTMENTS,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record a ${type} notification for users ${recipients.join(', ')}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Renders a slot the way it reads in a push banner: "Aug 16, 2025 at 09:00". */
  private formatSlot(date: Date, time: string): string {
    const day = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${day} at ${time.slice(0, 5)}`;
  }

  async createStudentClinicalAppointment(
    currentUser: AuthenticatedUser,
    dto: CreateStudentClinicalAppointmentDto,
  ) {
    const booked = await this.dataSource.transaction(async (manager) => {
      const lockedCase = await manager
        .getRepository(ClinicalCase)
        .createQueryBuilder('clinicalCase')
        .setLock('pessimistic_write')
        .where('clinicalCase.id = :id', { id: dto.clinicalCaseId })
        .getOne();

      if (!lockedCase) {
        throw new NotFoundException('Clinical Case not Found');
      }

      const loadedCase = await manager.findOne(ClinicalCase, {
        where: { id: dto.clinicalCaseId },
        relations: {
          subject: { studyYear: true },
          // The patient's user account is what the booking notification is
          // addressed to; it is absent for walk-in patients.
          patient: { user: true },
          assignedStudent: true,
          assignedSupervisor: true,
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
        currentUser.userId,
        manager,
      );

      if (loadedCase.subject.studyYear.level !== studentCurrentYear.level) {
        throw new ForbiddenException(
          'Student is not in the same study year as the clinical case',
        );
      }

      const sectionSubject =
        await this.studentService.getSectionSubjectForStudent(
          currentUser.userId,
          loadedCase.subject.id,
          manager,
        );

      const { patient } = loadedCase;
      const supervisor = sectionSubject.supervisor;
      console.log(supervisor);

      const { startTime, endTime, appointmentDate } =
        await this.checkSupervisorAvailability(
          dto.appointmentDate,
          dto.appointmentStart,
          supervisor.id,
          manager,
        );

      // const existingAppointment = await manager.findOne(ClinicalAppointment, {
      //   where: {
      //     // clinicalCase: { id: loadedCase.id },
      //     student: { id: student.id },
      //     status: ClinicalAppointmentStatus.SCHEDULED,
      //     appointmentStart: dto.appointmentStart,
      //   },
      // });
      // if (existingAppointment) {
      //   throw new ConflictException('A clinical appointment already exists');
      // }
      const existingAppointment = await manager
        .getRepository(ClinicalAppointment)
        .createQueryBuilder('appointment')
        .where('appointment.studentId = :studentId', {
          studentId: student.id,
        })
        .andWhere('appointment.status = :status', {
          status: ClinicalAppointmentStatus.SCHEDULED,
        })
        .andWhere('appointment.appointmentDate = :appointmentDate', {
          appointmentDate,
        })
        .andWhere(
          `appointment.appointmentStart < :newEnd
     AND appointment.appointmentEnd > :newStart`,
          {
            newStart: startTime,
            newEnd: endTime,
          },
        )
        .getOne();

      if (existingAppointment) {
        throw new ConflictException(
          'The student already has a clinical appointment during this time.',
        );
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

      await manager.save(clinicalAppointment);

      // Handed back so the notification is sent only once the booking has
      // actually committed.
      return {
        appointmentId: clinicalAppointment.id,
        clinicalCaseId: loadedCase.id,
        slot: this.formatSlot(dto.appointmentDate, startTime),
        patientUserId: patient?.user?.id,
        supervisorUserId: supervisor?.user?.id,
        studentName: student.user?.full_name,
      };
    });

    // The student is the one booking, so only the other two parties are told.
    await this.notifyParties(
      [booked.patientUserId, booked.supervisorUserId],
      {
        title: 'New appointment booked',
        body: `${booked.studentName ?? 'A student'} booked an appointment for ${booked.slot}.`,
        data: {
          appointmentId: String(booked.appointmentId),
          clinicalCaseId: String(booked.clinicalCaseId),
        },
      },
      NotificationType.APPOINTMENT_BOOKED,
    );

    return {
      message: 'Appointment created successfully',
    };
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
    subjectId: number,
  ) {
    const sectionSubject =
      await this.studentService.getSectionSubjectForStudent(
        currentUser.userId,
        subjectId,
      );

    return this.supervisorAvailibilityService.getAvailableSlots(
      date,
      sectionSubject.supervisor.id,
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
        clinicalCase: {
          subject: {
            clinic: true,
          },
        },
        patient: true,
        supervisor: true,
      },
    });

    if (appointments.length === 0) {
      return [];
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
        subject: appointment.clinicalCase.subject.name,
        clinic: appointment.clinicalCase.subject.clinic.name,
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

    // Any of the three can cancel, so the actor is excluded by id rather than
    // by role: whoever pressed cancel already knows.
    const slot = this.formatSlot(
      appointment.appointmentDate,
      appointment.appointmentStart,
    );

    await this.notifyParties(
      [
        appointment.student?.user?.id,
        appointment.supervisor?.user?.id,
        appointment.patient?.user?.id,
      ].filter((recipientId) => recipientId !== user.userId),
      {
        title: 'Appointment cancelled',
        body: `The appointment on ${slot} was cancelled.`,
        data: { appointmentId: String(appointment.id) },
      },
      NotificationType.APPOINTMENT_CANCELLED,
    );

    return appointment;
  }

  async updateAppointmentSchedule(
    id: number,
    user: AuthenticatedUser,
    dto: UpdateAppointmentScheduleDto,
  ) {
    const rescheduled = await this.dataSource.transaction(async (manager) => {
      const appointment = await manager.findOne(ClinicalAppointment, {
        where: { id },
        relations: {
          student: { user: true },
          // Both are loaded with their user account because they are the ones
          // notified about the new slot.
          supervisor: { user: true },
          patient: { user: true },
        },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment Not Found');
      }
      if (!appointment.student) {
        throw new NotFoundException('Student Not Found');
      }
      if (!appointment.student.user) {
        throw new NotFoundException('User Not Found');
      }
      if (appointment.student.user.id !== user.userId) {
        throw new ForbiddenException('This appointment does not belong to you');
      }

      if (appointment.status !== ClinicalAppointmentStatus.SCHEDULED) {
        throw new ConflictException(
          'Only scheduled appointments can be rescheduled',
        );
      }

      const currentStart = this.combineDateAndTime(
        appointment.appointmentDate,
        appointment.appointmentStart,
      );
      const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000);

      if (currentStart <= cutoff) {
        throw new ConflictException(
          'Appointments can only be rescheduled more than 24 hours before the start time',
        );
      }

      const { startTime, endTime } = await this.checkSupervisorAvailability(
        dto.appointmentDate,
        dto.appointmentStart,
        appointment.supervisor.id,
        manager,
      );

      const conflictingAppointment = await manager.findOne(
        ClinicalAppointment,
        {
          where: {
            id: Not(appointment.id),
            supervisor: { id: appointment.supervisor.id },
            appointmentDate: dto.appointmentDate,
            appointmentStart: startTime,
            status: ClinicalAppointmentStatus.SCHEDULED,
          },
        },
      );

      if (conflictingAppointment) {
        throw new ConflictException(
          'The supervisor is already booked at this time',
        );
      }

      appointment.appointmentDate = dto.appointmentDate;
      appointment.appointmentStart = startTime;
      appointment.appointmentEnd = endTime;

      await manager.save(appointment);

      return {
        message: 'Appointment rescheduled successfully',
        data: {
          id: appointment.id,
          appointmentDate: appointment.appointmentDate,
          appointmentStart: appointment.appointmentStart,
          appointmentEnd: appointment.appointmentEnd,
          status: appointment.status,
        },
        recipients: {
          patientUserId: appointment.patient?.user?.id,
          supervisorUserId: appointment.supervisor?.user?.id,
        },
        slot: this.formatSlot(dto.appointmentDate, startTime),
      };
    });

    // Only after the new slot is committed, so a rolled-back reschedule never
    // announces a time that was never taken. The student made the change.
    await this.notifyParties(
      [
        rescheduled.recipients.patientUserId,
        rescheduled.recipients.supervisorUserId,
      ],
      {
        title: 'Appointment rescheduled',
        body: `The appointment moved to ${rescheduled.slot}.`,
        data: { appointmentId: String(rescheduled.data.id) },
      },
      NotificationType.APPOINTMENT_RESCHEDULED,
    );

    return {
      message: rescheduled.message,
      data: rescheduled.data,
    };
  }

  async getUpcomingAppointments(user: AuthenticatedUser) {
    const patient = await this.patientRepository.findOne({
      where: { user: { id: user.userId } },
    });
    if (!patient) {
      throw new NotFoundException('Patient Not Found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await this.clinicalAppointmentRepository.find({
      where: {
        patient: { id: patient.id },
        status: ClinicalAppointmentStatus.SCHEDULED,
        appointmentDate: MoreThanOrEqual(today),
      },
      relations: {
        clinicalCase: true,
        student: { user: true },
        supervisor: { user: true },
      },
      order: {
        appointmentDate: 'ASC',
        appointmentStart: 'ASC',
      },
    });

    const now = new Date();
    const upcoming = appointments
      .filter(
        (appointment) =>
          this.combineDateAndTime(
            appointment.appointmentDate,
            appointment.appointmentStart,
          ) > now,
      )
      .map((appointment) => ({
        appointmentId: appointment.id,
        clinicalCaseId: appointment.clinicalCase?.id,
        appointmentDate: appointment.appointmentDate,
        appointmentStart: appointment.appointmentStart,
        appointmentEnd: appointment.appointmentEnd,
        studentName: appointment.student?.user?.full_name,
        supervisorName: appointment.supervisor?.user?.full_name,
        status: appointment.status,
      }));

    return {
      message: 'Upcoming appointments retrieved successfully',
      data: upcoming,
    };
  }

  async getPastAppointments(user: AuthenticatedUser) {
    const patient = await this.patientRepository.findOne({
      where: { user: { id: user.userId } },
    });
    if (!patient) {
      throw new NotFoundException('Patient Not Found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await this.clinicalAppointmentRepository.find({
      where: {
        patient: { id: patient.id },
        appointmentDate: LessThanOrEqual(today),
      },
      relations: {
        clinicalCase: true,
        student: { user: true },
        supervisor: { user: true },
      },
      order: {
        appointmentDate: 'DESC',
        appointmentStart: 'DESC',
      },
    });

    const now = new Date();
    const past = appointments
      .filter(
        (appointment) =>
          this.combineDateAndTime(
            appointment.appointmentDate,
            appointment.appointmentEnd,
          ) <= now,
      )
      .map((appointment) => ({
        appointmentId: appointment.id,
        clinicalCaseId: appointment.clinicalCase?.id,
        appointmentDate: appointment.appointmentDate,
        appointmentStart: appointment.appointmentStart,
        appointmentEnd: appointment.appointmentEnd,
        studentName: appointment.student?.user?.full_name,
        supervisorName: appointment.supervisor?.user?.full_name,
        status: appointment.status,
      }));

    return {
      message: 'Past appointments retrieved successfully',
      data: past,
    };
  }
  async getUpcomingAppointmentsForStudent(user: AuthenticatedUser) {
    const student = await this.studentRepository.findOne({
      where: { user: { id: user.userId } },
    });
    if (!student) {
      throw new NotFoundException('Student Not Found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await this.clinicalAppointmentRepository.find({
      where: {
        student: { id: student.id },
        status: ClinicalAppointmentStatus.SCHEDULED,
        appointmentDate: MoreThanOrEqual(today),
      },
      relations: {
        clinicalCase: true,
        patient: { user: true },
        supervisor: { user: true },
      },
      order: {
        appointmentDate: 'ASC',
        appointmentStart: 'ASC',
      },
    });

    const now = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments: StudentUpcomingAppointmentDto[] = [];
    const upcomingAppointments: StudentUpcomingAppointmentDto[] = [];

    for (const appointment of appointments) {
      const start = this.combineDateAndTime(
        appointment.appointmentDate,
        appointment.appointmentStart,
      );
      if (start <= now) continue;

      const mapped: StudentUpcomingAppointmentDto = {
        appointmentId: appointment.id,
        clinicalCaseId: appointment.clinicalCase?.id,
        appointmentDate: appointment.appointmentDate,
        appointmentStart: appointment.appointmentStart,
        appointmentEnd: appointment.appointmentEnd,
        supervisorName: appointment.supervisor?.user?.full_name,
        patientName: appointment.patient?.full_name,
        status: appointment.status,
      };

      const day = this.combineDateAndTime(appointment.appointmentDate, '00:00');

      if (day < tomorrow) {
        todayAppointments.push(mapped);
      } else {
        upcomingAppointments.push(mapped);
      }
    }

    return {
      message: 'Upcoming appointments retrieved successfully',
      data: {
        today: todayAppointments,
        upcoming: upcomingAppointments,
      },
    };
  }
}
