import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalAppointment } from './clinical-appointments.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
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

@Injectable()
export class ClinicalAppointmentsService {
  constructor(
    @InjectRepository(ClinicalAppointment) readonly clinicalAppointmentRepository: Repository<ClinicalAppointment>,
    @InjectRepository(ClinicalCase) readonly clinicalCaseRepository: Repository<ClinicalCase>,
    @InjectRepository(Student) readonly studentRepository: Repository<Student>,
    @InjectRepository(Patient) readonly patientRepository: Repository<Patient>,
    @InjectRepository(Supervisor) readonly supervisorRepository: Repository<Supervisor>,
    private readonly dataSource: DataSource,
    @InjectRepository(ExaminationRequest) readonly examinationRequestRepository: Repository<ExaminationRequest>,
    @InjectRepository(InitialExamination) readonly initialExaminationRepository: Repository<InitialExamination>,
    private readonly supervisorAvailibilityService: SupervisorAvailabilityService
  ) { }

  async createStudentClinicalAppointment(dto: CreateStudentClinicalAppointmentDto) {
    const [clinicalCase, student, patient, supervisor, request] = await Promise.all([
      this.clinicalCaseRepository.findOneBy({ id: dto.clinical_case }),
      this.studentRepository.findOneBy({ id: dto.student }),
      this.patientRepository.findOneBy({ id: dto.patient }),
      this.supervisorRepository.findOneBy({ id: dto.supervisor }),
      this.examinationRequestRepository.findOne({
        where: {
          id: dto.patient,
          status: ExaminationRequestStatus.CONVERTED_TO_CASE,
        },
      }),
    ]);

    if (!clinicalCase) {
      throw new NotFoundException('Clinical Case not Found');
    }
    if (!student) {
      throw new NotFoundException('Student not Found');
    }
    if (!patient) {
      throw new NotFoundException('Patient not Found');
    }
    if (!supervisor) {
      throw new NotFoundException('Supervisor not Found');
    }
    if (!request) {
      throw new NotFoundException('Examination Request Not Found');
    }


    const initialExamination = await this.initialExaminationRepository.findOneBy({
      request,
    });
    if (!initialExamination) {
      throw new NotFoundException('Initial Examination not Found');
    }
    if (initialExamination.status === InitialExaminationStatus.COMPLETED) {
      throw new NotFoundException(
        "Initial Examination Status doesn't allow for another clinical appointment",
      );
    }

    if (clinicalCase.status !== ClinicalCaseStatus.OPEN) {
      throw new ConflictException("Clinical Case is not open")
    }

    const existingAppointment = await this.clinicalAppointmentRepository.findOne({
      where: {
        clinicalCase,
        student,
        patient,
        supervisor,
        appointmentStart: dto.appointment_start,
        appointmentEnd: dto.appointment_end,
        appointmentDate: dto.appointment_date,
        status: ClinicalAppointmentStatus.SCHEDULED,
      },
    });
    if (existingAppointment) {
      throw new ConflictException('A clinical appointment already exists with the same data');
    }

    return this.dataSource.transaction(async (manager) => {
      const { startTime, endTime } = await this.checkSuperVisorAvailability(
        dto.appointment_date,
        dto.appointment_start,
        dto.supervisor,
        manager,
      );

      const clinicalAppointment = manager.getRepository(ClinicalAppointment).create({
        clinicalCase,
        student,
        patient,
        supervisor,
        appointmentDate: dto.appointment_date,
        appointmentStart: startTime,
        appointmentEnd: endTime,
        status: ClinicalAppointmentStatus.SCHEDULED,
      });

      this.clinicalCaseRepository.update(clinicalCase.id, { status: ClinicalCaseStatus.ASSIGNED })

      return manager.save(clinicalAppointment);
    });
  }

  private async checkSuperVisorAvailability(
    date: Date,
    time: string,
    supervisorId: number,
    manager: EntityManager,
  ) {
    const availableSlot = await this.supervisorAvailibilityService.validateSlotAvailability(
      date,
      time,
      supervisorId,
      manager,
    );

    return availableSlot;
  }


  async updateAppointment(id: number, user: AuthenticatedUser, dto: UpdateStudentClinicalAppointmentDto) {
    const appointment = await this.clinicalAppointmentRepository.findOneBy({ id })
    if (!appointment) {
      throw new NotFoundException("Appointment Not Found")
    }
    if (user.role === UserRole.STUDENT && appointment.student.user.id !== user.userId) {
      throw new ForbiddenException("Appointment isn't for this user")
    }
    if (user.role === UserRole.PATIENT && appointment.patient.user?.id !== user.userId) {

      throw new ForbiddenException("Appointment isn't for this patient")
    }
    return await this.clinicalAppointmentRepository.update(id, dto)
  }

}
