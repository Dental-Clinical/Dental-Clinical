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
import { IsNull, Repository } from 'typeorm';
import { CreateClinicalCaseDto } from './dto/create-clinical-case.dto';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
import { InitialExaminationStatus } from 'src/initial-examination/enums/initial-examination-status.enum';
import { ClinicalCaseStatus } from './enums/clinical-case-status.enum';

@Injectable()
export class ClinicalCaseService {
  constructor(
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    private readonly initialExaminationRepository: Repository<InitialExamination>,
  ) {}
  private async create(dto: CreateClinicalCaseDto) {
    const initialExamination = await this.initialExaminationRepository.findOne({
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

    const clinicalCase = this.clinicalCaseRepository.create({
      initialExamination: initialExamination,
      patient: initialExamination.request.patient,
      request: initialExamination.request,
      subject: initialExamination.subject,
      status: ClinicalCaseStatus.OPEN,
    });

    return await this.clinicalCaseRepository.save(clinicalCase);
  }
  async findAll() {
    return await this.clinicalCaseRepository.find({
      relations: {
        patient: true,
        subject: true,
        assignedStudent: true,
      },
    });
  }
  async findOne(id: number) {
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        subject: true,
        assignedStudent: true,
      },
    });
    if (!clinicalCase) {
      throw new NotFoundException('Clinical Case not found');
    }
    return clinicalCase;
  }
  async updateStatus() {}
  async findOpenCases() {
    const openCases = await this.clinicalCaseRepository.find({
      where: { status: ClinicalCaseStatus.OPEN, assignedStudent: IsNull() },
      relations: {
        patient: true,
        subject: true,
        assignedStudent: true,
        initialExamination: true,
        request: true,
      },
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
  public async createFromInitialExamination(initialExaminationId: number) {
    return await this.create({ initialExaminationId });
  }
}
