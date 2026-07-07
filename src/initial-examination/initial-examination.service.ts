import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InitialExamination } from './initial-examination.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateInitialExaminationDto } from './dto/create-initatil-examination.dto';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ExaminationAppointmentsService } from 'src/examination-appointments/examination-appointments.service';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { User } from 'src/users/user.entity';
import { ExaminationAppointment } from 'src/examination-appointments/examination-appointment.entity';
import { InitialExaminationStatus } from './enums/initial-examination-status.enum';
import { request } from 'express';
import { UpdateInitialExaminationDto } from './dto/update-initial-examination.dto';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseService } from 'src/clinical-case/clinical-case.service';

@Injectable()
export class InitialExaminationService {
  constructor(
    @InjectRepository(InitialExamination) private readonly initialExaminationRepository: Repository<InitialExamination>,
    @InjectRepository(Coordinator) private readonly coordinatorRepository: Repository<Coordinator>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ExaminationAppointment) private readonly examinationAppointmentRepository: Repository<ExaminationAppointment>,
    @InjectRepository(ExaminationRequest) private readonly examinationRequestRepository: Repository<ExaminationRequest>,
    private readonly dataSource: DataSource,
    private readonly clinicalCaseService: ClinicalCaseService
  ) { }


  async createInitialExamination(dto: CreateInitialExaminationDto) {
    const [request, appointment, coordinator] = await Promise.all([
      this.examinationRequestRepository.findOneBy({ id: dto.request_id }),
      this.examinationAppointmentRepository.findOneBy({ id: dto.appointment_id }),
      this.coordinatorRepository.findOne({
        where: { id: dto.coordinator_id },
        relations: { user: true },
      }),
    ]);

    if (!request) {
      throw new NotFoundException("Examination Request doesn't exist");
    }
    if (!appointment) {
      throw new NotFoundException("Appointment Not Found");
    }
    if (!coordinator || !coordinator.user?.is_active) {
      throw new NotFoundException("Coordinator Not Found or disabled");
    }

    const existingInitialRequest = await this.initialExaminationRepository.findOneBy({ request: request })

    if (existingInitialRequest) {
      throw new ConflictException("An Initial Examination already exists for this Examination Request")
    }

    await this.dataSource.transaction(async (manager) => {
      const initialExamination = manager.create(InitialExamination, {
        request,
        appointment,
        coordinator,
        subject: { id: dto.subject_id },
        clinicalCase: { id: dto.clinical_case_id },
        diagnosis: dto.diagnosis,
        clinicalFindings: dto.clinical_findings,
        status: InitialExaminationStatus.IN_PROGRESS,
      })

      await manager.save(initialExamination)

      await this.clinicalCaseService.createFromInitialExamination(initialExamination.id)

      request.status = ExaminationRequestStatus.CONVERTED_TO_CASE

      await this.examinationRequestRepository.save(request)

    })

  }


  async getInitialExamination(id: number) {
    const initialExamination = await this.initialExaminationRepository.findOneBy({ id })
    if (!initialExamination) {
      throw new NotFoundException("Initial Examination not found")
    }
    return initialExamination
  }

  async updateInitialExamination(id: number, dto: UpdateInitialExaminationDto) {
    const initialExamination = await this.initialExaminationRepository.existsBy({ id })
    if (!initialExamination) {
      throw new NotFoundException("Initial Examination not found")
    }
    await this.initialExaminationRepository.update(id, dto)
  }

  async getAllInitialExamination() {
    const initialExaminations = await this.initialExaminationRepository.find()
    return initialExaminations
  }

}
