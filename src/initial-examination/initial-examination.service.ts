import {
  BadRequestException,
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
import { Patient } from 'src/patients/patient.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';

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
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly dataSource: DataSource,
    private readonly clinicalCaseService: ClinicalCaseService,
  ) {}

  async createInitialExamination(
    userId: number,
    dto: CreateInitialExaminationDto,
  ) {
    if (dto.request_id === undefined && dto.appointment_id !== undefined) {
      throw new BadRequestException(
        'request_id and appointment_id must be provided together',
      );
    }
    const coordinator = await this.coordinatorRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    const [patient, subject] = await Promise.all([
      this.patientRepository.findOne({
        where: { id: dto.patient_id },
      }),
      this.subjectRepository.findOne({
        where: { id: dto.subject_id, is_active: true },
      }),
    ]);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (!coordinator || !coordinator.user?.is_active) {
      throw new NotFoundException('Coordinator not found or disabled');
    }

    return await this.dataSource.transaction(async (manager) => {
      const requestRepository = manager.getRepository(ExaminationRequest);

      const appointmentRepository = manager.getRepository(
        ExaminationAppointment,
      );
      let request: ExaminationRequest | null = null;
      let appointment: ExaminationAppointment | null = null;
      request = await requestRepository.findOne({
        where: { id: dto.request_id },
        relations: {
          patient: true,
        },
      });

      if (!request) {
        throw new NotFoundException("Examination request doesn't exist");
      }

      if (request.patient.id !== patient.id) {
        throw new ConflictException(
          'Examination request does not belong to this patient',
        );
      }

      if (request.status !== ExaminationRequestStatus.PENDING) {
        throw new ConflictException(
          'Examination request is not in a valid state for initial examination',
        );
      }
      if (dto.appointment_id !== undefined) {
        appointment = await appointmentRepository.findOne({
          where: { id: dto.appointment_id },
        });

        if (!appointment) {
          throw new NotFoundException('Appointment not found');
        }

        if (appointment.request_id !== request.id) {
          throw new ConflictException(
            'Appointment does not belong to the examination request',
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
        const existingExamination = await manager
          .getRepository(InitialExamination)
          .findOne({
            where: {
              request: { id: request.id },
            },
          });

        if (existingExamination) {
          throw new ConflictException(
            'An initial examination already exists for this examination request',
          );
        }
      }

      const initialExamination = manager.create(InitialExamination, {
        request: request,
        appointment: appointment || null,
        patient,
        subject,
        coordinator,
        diagnosis: dto.diagnosis,
        clinicalFindings: dto.clinicalFindings,
        examined_at: new Date(),
        status: InitialExaminationStatus.COMPLETED,
      });
      await manager.save(initialExamination);

      const clinicalCase =
        await this.clinicalCaseService.createFromInitialExamination(
          initialExamination.id,
          subject.id,
          manager,
        );

      request.status = ExaminationRequestStatus.CONVERTED_TO_CASE;

      await requestRepository.save(request);
      if (appointment) {
        appointment.status = ExaminationAppointmentStatus.COMPLETED;
        await appointmentRepository.save(appointment);
      }

      return {
        id: initialExamination.id,
        status: initialExamination.status,
        diagnosis: initialExamination.diagnosis,
        clinicalFindings: initialExamination.clinicalFindings,
        examinedAt: initialExamination.examined_at,
        // clinicalCase: {
        //   id: clinicalCase.id,
        //   status: clinicalCase.status,
        // },
        request: {
          id: request?.id,
          status: request?.status,
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
        id: examination.patient.id,
        fullName: examination.patient.full_name,
        phone: examination.patient.phone,
        medicalHistory: examination.patient.medical_history,
        allergies: examination.patient.allergies,
        currentMedications: examination.patient.current_medications,
      },

      request: {
        id: examination.request?.id,
        chiefComplaint: examination.request?.chief_complaint,
        symptoms: examination.request?.symptoms,
        status: examination.request?.status,
      },

      appointment: {
        date: examination.appointment?.appointment_date,
        startTime: examination.appointment?.appointment_start,
        endTime: examination.appointment?.appointment_end,
        status: examination.appointment?.status,
      },

      coordinator: {
        id: examination.coordinator.id,
        name: examination.coordinator.user.full_name,
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
      },
      order: {
        created_at: 'DESC',
      },
    });
    return initialExaminations.map((examination) => ({
      id: examination.id,
      patient: examination.patient.full_name,
      coordinator: examination.coordinator.user.full_name,
      status: examination.status,
      appointmentDate: examination.appointment?.appointment_date,
      clinicalCaseStatus: examination.clinicalCase.status,
    }));
  }
}
