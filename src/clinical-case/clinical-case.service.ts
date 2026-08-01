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
import { EntityManager, In, IsNull, Repository } from 'typeorm';
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
import { OpenCasesSummary } from './dto/open-clinical-cases-summary.dto';
import { StudentCasesSummaryDto } from './dto/student-cases-summary.dto';
import { StudentAssignedCaseDetailsDto } from './dto/student-assigned-case-details.dto';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { DateTimeUtils } from 'src/utils/date-time.utils';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';

@Injectable()
export class ClinicalCaseService {
  constructor(
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    @InjectRepository(DiagnosisSubmission)
    private readonly diagnosisSubmissionRepository: Repository<DiagnosisSubmission>,
    @InjectRepository(TreatmentSession)
    private readonly treatmentSessionsRepository: Repository<TreatmentSession>,
    @InjectRepository(SessionMaterial)
    private readonly sessionMaterialRepository: Repository<SessionMaterial>,
    private readonly studentService: StudentService,
  ) {}
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
  async findAll(
    dto: FilterClinicalCasesDto,
  ): Promise<ClinicalCaseSummaryDto[]> {
    const {
      status,
      subjectId,
      assignedStudentId,
      studyYearId,
      patientName,
      fromDate,
      toDate,
    } = dto;

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
      qb.andWhere('assignedStudent.id = :assignedStudentId', {
        assignedStudentId,
      });
    }

    if (studyYearId) {
      qb.innerJoin(
        'assignedStudent.studentAcademicYears',
        'studentAcademicYear',
        'studentAcademicYear.isCurrent = true',
      )
        .innerJoin('studentAcademicYear.studyYear', 'studyYear')
        .andWhere('studyYear.id = :studyYearId', { studyYearId });
    }

    if (patientName) {
      qb.andWhere('patient.full_name ILIKE :patientName', {
        patientName: `%${patientName}%`,
      });
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
  async findOpenClinicalCaseDetails(
    id: number,
  ): Promise<ClinicalCaseDetailsDto> {
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        request: true,
        subject: true,
        clinicalAppointments: true,
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

      patient_request: {
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
  async findStudentAssignedClinicalCase(id: number, userId: number) {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: {
        id,
        assignedStudent: { id: student.id },
        status: ClinicalCaseStatus.ASSIGNED,
      },
      relations: {
        patient: true,
        request: true,
        subject: true,
        clinicalAppointments: {
          supervisor: true,
        },
        assignedStudent: {
          user: true,
        },
      },
    });
    if (!clinicalCase) {
      throw new NotFoundException(
        'Clinical Case not found for this student or not assigned',
      );
    }
    const nextAppointment = clinicalCase.clinicalAppointments
      .filter((a) => a.status === ClinicalAppointmentStatus.SCHEDULED)
      .sort(
        (a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime(),
      )[0];
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

      patientRequest: {
        id: clinicalCase.request.id,
        chiefComplaint: clinicalCase.request.chief_complaint,
        symptoms: clinicalCase.request.symptoms,
      },

      subject: {
        id: clinicalCase.subject.id,
        name: clinicalCase.subject.name,
      },

      assignedStudent: {
        id: clinicalCase.assignedStudent.id,
        name: clinicalCase.assignedStudent.user.full_name,
      },
      assignedSupervisor: {
        id: clinicalCase.assignedSupervisor.id,
        name: clinicalCase.assignedSupervisor.user.full_name,
      },
      nextAppointment: {
        id: nextAppointment?.id,
        appointmentDate: nextAppointment?.appointmentDate,
        startTime: nextAppointment?.appointmentStart,
        endTime: nextAppointment?.appointmentEnd,
      },
    };
  }
  async findStudentCaseDetails(id: number, userId: number) {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id, assignedStudent: { id: student.id } },
      relations: {
        patient: true,
        assignedSupervisor: { user: true },
        clinicalAppointments: true,
        subject: true,
      },
    });
    if (!clinicalCase) {
      throw new NotFoundException('Clinical Case not found for this student');
    }

    const diagnosisSubmission =
      await this.diagnosisSubmissionRepository.findOne({
        where: { clinicalCase: { id: clinicalCase.id } },
        relations: { plannedProcedures: { subjectProcedure: true } },
      });
    if (!diagnosisSubmission) {
      throw new NotFoundException('Diagnosis Submission not found');
    }

    const treatmentSessions = await this.treatmentSessionsRepository.find({
      where: { clinicalCase: { id: clinicalCase.id } },
      relations: {
        clinicalAppointment: {
          supervisor: { user: true },
        },
      },
    });

    if (!treatmentSessions) {
      throw new NotFoundException('Treatment Sessions not found');
    }

    const sessionMaterials = await this.sessionMaterialRepository.find({
      where: {
        treatmentSession: {
          clinicalCase: { id: clinicalCase.id },
        },
      },
      relations: {
        material: true,
      },
    });

    if (!sessionMaterials) {
      throw new NotFoundException('Session Materials not found');
    }
    const caseInfo = this.buildCaseInfo(clinicalCase);
    const treatmentPlan = this.buildTreatmentPlan(diagnosisSubmission);
    const materials = this.buildMaterials(sessionMaterials);
    const timeline = this.buildTimeline(treatmentSessions);
    const supervisorNotes = this.buildSupervisorNotes(treatmentSessions);

    return {
      caseInfo,
      treatmentPlan,
      materials,
      timeline,
      supervisorNotes,
    };
  }
  private buildCaseInfo(clinicalCase: ClinicalCase) {
    const nextAppointment = clinicalCase.clinicalAppointments
      .filter((a) => a.status === ClinicalAppointmentStatus.SCHEDULED)
      .sort(
        (a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime(),
      )[0];
    return {
      id: clinicalCase.id,
      status: clinicalCase.status,

      patientName: clinicalCase.patient.full_name,

      patientId: clinicalCase.patient.id,

      patientAge: DateTimeUtils.calculateAge(clinicalCase.patient.dateOfBirth),

      subject: clinicalCase.subject.name,

      supervisor: clinicalCase.assignedSupervisor.user.full_name,

      nextSession: nextAppointment
        ? {
            id: nextAppointment.id,
            appointmentDate: nextAppointment.appointmentDate,
            startTime: nextAppointment.appointmentStart,
          }
        : undefined,
    };
  }
  private buildTreatmentPlan(diagnosisSubmission: DiagnosisSubmission) {
    const treatmentPlan = diagnosisSubmission.plannedProcedures.map(
      (procedure) => {
        return {
          procedureId: procedure.id,
          procedure: procedure.subjectProcedure.name,
          tooth: procedure.toothNumber,
          status: procedure.status,
        };
      },
    );
    return { targetTeeth: treatmentPlan };
  }
  private buildMaterials(sessionMaterials: SessionMaterial[]) {
    return Array.from(
      new Map(
        sessionMaterials.map((sm) => [
          sm.material.id,
          {
            id: sm.material.id,
            name: sm.material.name,
          },
        ]),
      ).values(),
    );
  }
  private buildTimeline(treatmentSessions: TreatmentSession[]) {
    return treatmentSessions.map((session) => ({
      sessionId: session.id,

      title: session.title,

      status: session.status,

      appointmentDate: session.clinicalAppointment.appointmentDate,

      startTime: session.clinicalAppointment.appointmentStart,
    }));
  }
  private buildSupervisorNotes(treatmentSessions: TreatmentSession[]) {
    return treatmentSessions
      .filter(
        (session) =>
          session.supervisorNotes !== null &&
          session.supervisorNotes?.trim() !== '',
      )
      .map((session) => ({
        sessionId: session.id,
        sessionTitle: session.title,
        supervisor: session.clinicalAppointment.supervisor.user.full_name,
        createdAt: session.updatedAt.toLocaleDateString(),
        notes: session.supervisorNotes,
      }));
  }
  async findStudentCases(userId: number): Promise<StudentCasesSummaryDto> {
    // approved
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCases = await this.clinicalCaseRepository.find({
      where: { assignedStudent: { id: student.id } },
      relations: {
        patient: true,
        subject: true,
        treatmentSessions: true,
        assignedStudent: true,
      },
    });

    const cases = clinicalCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patientName: clinicalCase.patient.full_name,
        subjectName: clinicalCase.subject.name,
        status: clinicalCase.status,
        sessionCount:
          clinicalCase.status !== ClinicalCaseStatus.ASSIGNED
            ? clinicalCase.treatmentSessions.length
            : null,
      };
    });
    return { cases };
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
  async findOpenCases(userId: number): Promise<OpenCasesSummary> {
    // approved
    const studyYear = await this.studentService.getCurrentStudyYear(userId);

    const openCases = await this.clinicalCaseRepository.find({
      where: {
        status: In([ClinicalCaseStatus.OPEN, ClinicalCaseStatus.ASSIGNED]),
        assignedStudent: IsNull(),
        initialExamination: {
          coordinator: {
            user: true,
          },
        },
        subject: {
          section: true,
          is_active: true,
          studyYear: {
            id: studyYear.id,
          },
        },
      },
      relations: {
        patient: true,
        subject: true,
        request: true,
      },
    });
    const result = openCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patient: clinicalCase.patient.full_name,
        subject: clinicalCase.subject.name,
        coordinator: clinicalCase.initialExamination.coordinator.user.full_name,
        chiefComplaint: clinicalCase.request.chief_complaint,
      };
    });
    return {
      openCases: result,
    };
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
