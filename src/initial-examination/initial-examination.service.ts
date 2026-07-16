import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InitialExamination } from './initial-examination.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateInitialExaminationDto } from './dto/create-initial-examination.dto';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { ExaminationAppointment } from 'src/examination-appointments/examination-appointment.entity';
import { InitialExaminationStatus } from './enums/initial-examination-status.enum';
import { UpdateInitialExaminationDto } from './dto/update-initial-examination.dto';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { ClinicalCaseService } from 'src/clinical-case/clinical-case.service';
import { Subject } from 'src/subjects/subjects.entity';
import { ExaminationAppointmentStatus } from 'src/examination-requests/Enums/examination-appointment.enum';
import { InitialExaminationResponseDto } from './dto/initial-examination-response.dto';
import { InitialExaminationSummaryDto } from './dto/initial-examination-summary.dto';

@Injectable()
export class InitialExaminationService {
  constructor(
    @InjectRepository(InitialExamination)
    private readonly initialExaminationRepository: Repository<InitialExamination>,
    @InjectRepository(Coordinator)
    private readonly coordinatorRepository: Repository<Coordinator>,
    @InjectRepository(ExaminationAppointment)
    private readonly examinationAppointmentRepository: Repository<ExaminationAppointment>,
    @InjectRepository(ExaminationRequest)
    private readonly examinationRequestRepository: Repository<ExaminationRequest>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly dataSource: DataSource,
    private readonly clinicalCaseService: ClinicalCaseService,
  ) { }

  async createInitialExamination(
    dto: CreateInitialExaminationDto,
  ): Promise<InitialExaminationResponseDto> {
    const [request, appointment, coordinator, subject] = await Promise.all([
      this.examinationRequestRepository.findOneBy({ id: dto.request_id }),
      this.examinationAppointmentRepository.findOneBy({
        id: dto.appointment_id,
      }),
      this.coordinatorRepository.findOne({
        where: { id: dto.coordinator_id },
        relations: { user: true },
      }),
      this.subjectRepository.findOneBy({ id: dto.subject_id }),
    ]);

    if (!request) {
      throw new NotFoundException("Examination Request doesn't exist");
    }
    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }
    if (!coordinator || !coordinator.user?.is_active) {
      throw new NotFoundException('Coordinator Not Found or disabled');
    }
    if (!subject) {
      throw new NotFoundException('Subject Not Found');
    }

    if (request.status !== ExaminationRequestStatus.PENDING) {
      throw new ConflictException(
        'Examination Request is not in a valid state for initial examination',
      );
    }

    if (appointment.coordinator_id !== coordinator.id) {
      throw new ConflictException(
        'Coordinator is not assigned to this appointment',
      );
    }
    if (appointment.status !== ExaminationAppointmentStatus.SCHEDULED) {
      throw new ConflictException('Appointment is not in a valid state');
    }

    const existingInitialExamination =
      await this.initialExaminationRepository.findOne({
        where: { request: { id: dto.request_id } },
      });

    if (existingInitialExamination) {
      throw new ConflictException(
        'An Initial Examination already exists for this Examination Request',
      );
    }
    if (appointment.request_id !== request.id) {
      throw new ConflictException(
        'Appointment does not belong to the examination request',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const initialExamination = manager
        .getRepository(InitialExamination)
        .create({
          request,
          appointment,
          coordinator,
          subject,
          diagnosis: dto.diagnosis,
          clinicalFindings: dto.clinicalFindings,
          status: InitialExaminationStatus.COMPLETED,
          examined_at: new Date(),
        });

      await manager.save(initialExamination);

      request.status = ExaminationRequestStatus.CONVERTED_TO_CASE;
      await manager.save(request);

      appointment.status = ExaminationAppointmentStatus.COMPLETED;
      await manager.save(appointment);

      await this.clinicalCaseService.createFromInitialExamination(
        initialExamination.id,
        manager,
      );

      const createdExamination = await manager.findOne(InitialExamination, {
        where: { id: initialExamination.id },
        relations: {
          request: true,
          clinicalCase: true,
          subject: true,
          coordinator: true,
        },
      });
      if (!createdExamination) {
        throw new NotFoundException(
          'Initial Examination not found after creation',
        );
      }
      return {
        id: createdExamination.id,
        diagnosis: createdExamination.diagnosis,
        clinicalFindings: createdExamination.clinicalFindings,
        status: createdExamination.status,
        examinedAt: createdExamination.examined_at,
        request: {
          id: createdExamination.request.id,
          status: createdExamination.request.status,
        },
        clinicalCase: {
          id: createdExamination.clinicalCase.id,
          status: createdExamination.clinicalCase.status,
        },
      };
    });
  }

  async getInitialExamination(id: number) {
    const examination = await this.initialExaminationRepository.findOne({
      where: { id },
      relations: {
        request: {
          patient: true,
        },
        appointment: true,
        coordinator: {
          user: true,
        },
        subject: true,
        clinicalCase: true,
      },
    });

    if (!examination) {
      throw new NotFoundException('Initial Examination not found');
    }
    return {
      id: examination.id,
      status: examination.status,
      examinedAt: examination.examined_at,

      diagnosis: examination.diagnosis,
      clinicalFindings: examination.clinicalFindings,

      patient: {
        id: examination.request.patient.id,
        fullName: examination.request.patient.full_name,
        phone: examination.request.patient.phone,
        medicalHistory: examination.request.patient.medical_history,
        allergies: examination.request.patient.allergies,
        currentMedications: examination.request.patient.current_medications,
      },

      request: {
        id: examination.request.id,
        chiefComplaint: examination.request.chief_complaint,
        symptoms: examination.request.symptoms,
        status: examination.request.status,
      },

      appointment: {
        date: examination.appointment.appointment_date,
        startTime: examination.appointment.appointment_start,
        endTime: examination.appointment.appointment_end,
        status: examination.appointment.status,
      },

      coordinator: {
        id: examination.coordinator.id,
        name: examination.coordinator.user.full_name,
      },

      subject: {
        id: examination.subject.id,
        name: examination.subject.name,
      },

      clinicalCase: examination.clinicalCase
        ? {
          id: examination.clinicalCase.id,
          status: examination.clinicalCase.status,
        }
        : null,
    };
  }

  async updateInitialExamination(id: number, dto: UpdateInitialExaminationDto) {
    const initialExamination = await this.initialExaminationRepository.existsBy(
      { id },
    );
    if (!initialExamination) {
      throw new NotFoundException('Initial Examination not found');
    }
    await this.initialExaminationRepository.update(id, dto);
  }

  async getAllInitialExamination(): Promise<InitialExaminationSummaryDto[]> {
    const initialExaminations = await this.initialExaminationRepository.find({
      relations: {
        appointment: true,
        coordinator: {
          user: true,
        },
        subject: true,
        clinicalCase: { patient: true },
      },
      order: {
        created_at: 'DESC',
      },
    });
    return initialExaminations.map((examination) => ({
      id: examination.id,
      patient: examination.clinicalCase.patient.full_name,
      coordinator: examination.coordinator.user.full_name,
      subject: examination.subject.name,
      status: examination.status,
      appointmentDate: examination.appointment.appointment_date,
      clinicalCaseStatus: examination.clinicalCase.status,
    }));
  }
}
