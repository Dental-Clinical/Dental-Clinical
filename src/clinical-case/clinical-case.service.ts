import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalCase } from './clinical-case.entity';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { CreateClinicalCaseDto } from './dto/create-clinical-case.dto';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
import { InitialExaminationStatus } from 'src/initial-examination/enums/initial-examination-status.enum';
import { ClinicalCaseStatus } from './enums/clinical-case-status.enum';
import { ClinicalCaseStateMachine } from './state-machine/clinical-case-state-machine';
import { UpdateClinicalCaseStatusDto } from './dto/update-clinical-case-status.dto';
import { ClinicalCaseSummaryDto } from './dto/clinical-case-summary.dto';
import { ClinicalCaseDetailsDto } from './dto/clinical-case-details.sto';
import { StudentService } from 'src/students/student.service';
import { FilterClinicalCasesDto } from './dto/get-filtered-clinical-cases.dto';

@Injectable()
export class ClinicalCaseService {
  constructor(
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    private readonly studentService: StudentService,
  ) { }
  private async create(dto: CreateClinicalCaseDto, manager: EntityManager) {
    const initialExamination = await manager.findOne(InitialExamination, {
      where: { id: dto.initialExaminationId },
      relations: {
        clinicalCase: true,
        request: {
          patient: true,
        },
        subject: true,
      },
    });

    if (!initialExamination) {
      throw new NotFoundException('Initial Examination not found');
    }

    if (!initialExamination.request) {
      throw new InternalServerErrorException(
        'Failed to retrieve request for Initial Examination',
      );
    }

    if (initialExamination.status !== InitialExaminationStatus.COMPLETED) {
      throw new BadRequestException('Initial Examination is not completed');
    }

    if (initialExamination.clinicalCase) {
      throw new HttpException(
        'Clinical Case already exists for this Initial Examination',
        HttpStatus.CONFLICT,
      );
    }

    const clinicalCase = manager.getRepository(ClinicalCase).create({
      initialExamination: initialExamination,
      patient: initialExamination.request.patient,
      request: initialExamination.request,
      subject: initialExamination.subject,
      status: ClinicalCaseStatus.OPEN,
    });

    return await manager.save(clinicalCase);
  }
  async findAll(dto: FilterClinicalCasesDto): Promise<ClinicalCaseSummaryDto[]> {
    const { status, subjectId, assignedStudentId, studyYearId, patientName, fromDate, toDate } = dto;

    const qb = this.clinicalCaseRepository
      .createQueryBuilder('clinicalCase')
      .leftJoinAndSelect('clinicalCase.patient', 'patient')
      .leftJoinAndSelect('clinicalCase.subject', 'subject')
      .leftJoinAndSelect('clinicalCase.assignedStudent', 'assignedStudent')
      .leftJoinAndSelect('assignedStudent.user', 'user');

    if (status) {
      qb.andWhere('clinicalCase.status = :status', { status });
    }

    if (subjectId) {
      qb.andWhere('subject.id = :subjectId', { subjectId });
    }

    if (assignedStudentId) {
      qb.andWhere('assignedStudent.id = :assignedStudentId', { assignedStudentId });
    }

    if (studyYearId) {
      qb.innerJoin('assignedStudent.studentAcademicYears', 'studentAcademicYear', 'studentAcademicYear.isCurrent = true')
        .innerJoin('studentAcademicYear.studyYear', 'studyYear')
        .andWhere('studyYear.id = :studyYearId', { studyYearId });
    }

    if (patientName) {
      qb.andWhere('patient.full_name ILIKE :patientName', { patientName: `%${patientName}%` });
    }

    if (fromDate) {
      qb.andWhere('clinicalCase.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('clinicalCase.createdAt <= :toDate', { toDate });
    }

    qb.orderBy('clinicalCase.createdAt', 'DESC');

    const clinicalCases = await qb.getMany();

    return clinicalCases.map((clinicalCase) => ({
      id: clinicalCase.id,
      status: clinicalCase.status,
      createdAt: clinicalCase.createdAt,
      patient: {
        id: clinicalCase.patient.id,
        fullName: clinicalCase.patient.full_name,
        phone: clinicalCase.patient.phone,
      },
      subject: {
        id: clinicalCase.subject.id,
        name: clinicalCase.subject.name,
      },
      assignedStudent: clinicalCase.assignedStudent
        ? {
          id: clinicalCase.assignedStudent.id,
          name: clinicalCase.assignedStudent.user.full_name,
        }
        : null,
    }));
  }
  async findOne(id: number): Promise<ClinicalCaseDetailsDto> {
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        request: true,
        subject: true,
        assignedStudent: {
          user: true,
        },
      },
    });
    if (!clinicalCase) {
      throw new NotFoundException('Clinical Case not found');
    }
    return {
      id: clinicalCase.id,
      status: clinicalCase.status,
      createdAt: clinicalCase.createdAt,

      patient: {
        id: clinicalCase.patient.id,
        fullName: clinicalCase.patient.full_name,
        phone: clinicalCase.patient.phone,
        medicalHistory: clinicalCase.patient.medical_history,
        allergies: clinicalCase.patient.allergies,
        currentMedications: clinicalCase.patient.current_medications,
      },

      request: {
        id: clinicalCase.request.id,
        chiefComplaint: clinicalCase.request.chief_complaint,
        symptoms: clinicalCase.request.symptoms,
      },

      subject: {
        id: clinicalCase.subject.id,
        name: clinicalCase.subject.name,
      },

      assignedStudent: clinicalCase.assignedStudent
        ? {
          id: clinicalCase.assignedStudent.id,
          name: clinicalCase.assignedStudent.user.full_name,
        }
        : null,
    };
  }
  async updateStatus(id: number, dto: UpdateClinicalCaseStatusDto) {
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id },
    });
    if (!clinicalCase) {
      throw new NotFoundException('Clinical Case not found');
    }
    this.validateTransition(clinicalCase.status, dto.status);
    clinicalCase.status = dto.status;
    return await this.clinicalCaseRepository.save(clinicalCase);
  }
  async findOpenCases(userId: number) {
    const studyYear = await this.studentService.getCurrentStudyYear(userId);

    const openCases = await this.clinicalCaseRepository.find({
      where: {
        status: ClinicalCaseStatus.OPEN,
        assignedStudent: IsNull(),
        subject: {
          is_active: true,
          studyYear: {
            id: studyYear.id,
          },
        },
      },
      relations: {
        patient: true,
        subject: {
          studyYear: true,
        },
        request: true,
      },
    });
    openCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patient: clinicalCase.patient.full_name,
        subject: clinicalCase.subject.name,
        chiefComplaint: clinicalCase.request.chief_complaint,
        status: clinicalCase.status,
      };
    });
    return openCases;
  }
  async findBySubject(subjectId: number) {
    return await this.clinicalCaseRepository.find({
      where: { subject: { id: subjectId } },
      relations: {
        patient: true,
        subject: true,
        assignedStudent: true,
        initialExamination: true,
        request: true,
      },
    });
  }
  async findAssignedCases() {
    const assignedCases = await this.clinicalCaseRepository.find({
      where: { status: ClinicalCaseStatus.ASSIGNED },
      relations: {
        patient: true,
        subject: true,
        assignedStudent: true,
        initialExamination: true,
        request: true,
      },
    });
    return assignedCases;
  }
  public async createFromInitialExamination(
    initialExaminationId: number,
    manager: EntityManager,
  ) {
    return await this.create({ initialExaminationId }, manager);
  }
  private validateTransition(
    current: ClinicalCaseStatus,
    next: ClinicalCaseStatus,
  ) {
    const validTransitions = ClinicalCaseStateMachine[current];
    if (!validTransitions.includes(next)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${next}`,
      );
    }
  }

}
