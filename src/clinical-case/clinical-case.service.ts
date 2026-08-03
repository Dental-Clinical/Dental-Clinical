import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalCase } from './clinical-case.entity';
import {
  EntityManager,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
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
import { PatientCasesSummaryDto } from './dto/patient-cases-summary.dto';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { DateTimeUtils } from 'src/utils/date-time.utils';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { Patient } from 'src/patients/patient.entity';
import { ClinicalCaseMedia } from 'src/clinical-case-media/clinical-case-media.entity';
import { UserRole } from 'src/constants/user-roles';
import {
  CASE_VIEW_POLICY,
  CaseViewerRole,
  CaseViewPolicy,
} from './case-view.policy';
import {
  CaseDetailsViewDto,
  CaseInfoDto,
  CaseMediaDto,
  SupervisorNoteDto,
  TimelineEntryDto,
  TreatmentPlanDto,
} from './dto/case-details-view.dto';

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
    const nextAppointment = this.findNextScheduledAppointment(clinicalCase);
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
    return this.findCaseDetails(id, userId, UserRole.STUDENT);
  }
  async findPatientCaseDetails(id: number, userId: number) {
    return this.findCaseDetails(id, userId, UserRole.PATIENT);
  }
  async findSupervisorCaseDetails(id: number, userId: number) {
    return this.findCaseDetails(id, userId, UserRole.SUPERVISOR);
  }
  /**
   * Restricts a case lookup to the cases the given actor owns. The actor is
   * passed in rather than read off the JWT so the switch stays exhaustive —
   * `AuthenticatedUser.role` is a plain string, and each route already pins
   * the role with `@Roles`.
   */
  private buildOwnershipWhere(
    id: number,
    userId: number,
    actor: CaseViewerRole,
  ): FindOptionsWhere<ClinicalCase> {
    switch (actor) {
      case UserRole.STUDENT:
        return { id, assignedStudent: { user: { id: userId } } };
      case UserRole.PATIENT:
        return { id, patient: { user: { id: userId } } };
      case UserRole.SUPERVISOR:
        return { id, assignedSupervisor: { user: { id: userId } } };
    }
  }
  /**
   * Returns the widest shape (`CaseDetailsViewDto`); each route narrows the
   * published contract via its own `@ApiOkResponse` DTO.
   */
  private async findCaseDetails(
    id: number,
    userId: number,
    actor: CaseViewerRole,
  ): Promise<CaseDetailsViewDto> {
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: this.buildOwnershipWhere(id, userId, actor),
      relations: {
        patient: true,
        assignedStudent: { user: true },
        assignedSupervisor: { user: true },
        clinicalAppointments: true,
        subject: true,
        media: true,
      },
    });
    if (!clinicalCase) {
      const exists = await this.clinicalCaseRepository.exists({
        where: { id },
      });
      if (exists) {
        throw new ForbiddenException("You can't access this clinical case");
      }
      throw new NotFoundException('Clinical Case not found');
    }

    // A case can be viewed before a diagnosis has been submitted; the
    // treatment plan is simply empty until then.
    const diagnosisSubmission =
      await this.diagnosisSubmissionRepository.findOne({
        where: { clinicalCase: { id: clinicalCase.id } },
        relations: { plannedProcedures: { subjectProcedure: true } },
      });

    const treatmentSessions = await this.treatmentSessionsRepository.find({
      where: { clinicalCase: { id: clinicalCase.id } },
      relations: {
        clinicalAppointment: {
          supervisor: { user: true },
        },
      },
    });

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

    const policy = CASE_VIEW_POLICY[actor];

    return {
      caseInfo: this.buildCaseInfo(clinicalCase, policy),
      treatmentPlan: this.buildTreatmentPlan(diagnosisSubmission),
      materials: this.buildMaterials(sessionMaterials),
      caseMedia: this.buildCaseMedia(clinicalCase.media),
      timeline: this.buildTimeline(treatmentSessions),
      ...(policy.includeSupervisorNotes
        ? { supervisorNotes: this.buildSupervisorNotes(treatmentSessions) }
        : {}),
    };
  }
  /**
   * Normalizes a Postgres `date` column to a 'YYYY-MM-DD' string.
   */
  private toDateString(value: Date | string): string {
    return DateTimeUtils.toDateString(value);
  }
  /**
   * The earliest still-scheduled appointment, or undefined if there is none.
   *
   * `appointmentDate` is a Postgres `date` column, which the driver hands back
   * as a 'YYYY-MM-DD' string despite the entity typing it as `Date` — so it
   * has no `.getTime()`. Combining it with the `time` column gives a real Date
   * to sort on and tie-breaks same-day appointments by start time.
   */
  private findNextScheduledAppointment(clinicalCase: ClinicalCase) {
    return clinicalCase.clinicalAppointments
      .filter((a) => a.status === ClinicalAppointmentStatus.SCHEDULED)
      .sort(
        (a, b) =>
          DateTimeUtils.combine(
            a.appointmentDate,
            a.appointmentStart,
          ).getTime() -
          DateTimeUtils.combine(
            b.appointmentDate,
            b.appointmentStart,
          ).getTime(),
      )[0];
  }
  private buildCaseInfo(
    clinicalCase: ClinicalCase,
    policy: CaseViewPolicy,
  ): CaseInfoDto {
    const nextAppointment = this.findNextScheduledAppointment(clinicalCase);
    return {
      id: clinicalCase.id,

      status: clinicalCase.status,

      subject: clinicalCase.subject.name,

      supervisor: clinicalCase.assignedSupervisor?.user?.full_name ?? null,

      nextSession: nextAppointment
        ? {
            id: nextAppointment.id,
            appointmentDate: this.toDateString(nextAppointment.appointmentDate),
            startTime: nextAppointment.appointmentStart,
          }
        : null,

      ...(policy.includePatientIdentity
        ? this.buildPatientIdentity(clinicalCase.patient)
        : {}),

      ...(policy.includeTreatingStudent
        ? {
            treatingStudent:
              clinicalCase.assignedStudent?.user?.full_name ?? null,
          }
        : {}),
    };
  }
  private buildPatientIdentity(patient: Patient) {
    return {
      patientName: patient.full_name,
      patientId: patient.id,
      // calculateAge has no null guard, and `new Date(null)` silently coerces
      // to 1970 — guard here rather than changing the shared util.
      patientAge: patient.dateOfBirth
        ? DateTimeUtils.calculateAge(patient.dateOfBirth)
        : null,
      patientGender: patient.gender ?? null,
    };
  }
  private buildTreatmentPlan(
    diagnosisSubmission: DiagnosisSubmission | null,
  ): TreatmentPlanDto {
    const treatmentPlan =
      diagnosisSubmission?.plannedProcedures?.map((procedure) => {
        return {
          procedureId: procedure.id,
          procedure: procedure.subjectProcedure.name,
          tooth: procedure.toothNumber,
          status: procedure.status,
        };
      }) ?? [];
    return { targetTeeth: treatmentPlan };
  }
  private buildCaseMedia(media: ClinicalCaseMedia[]): CaseMediaDto[] {
    return (media ?? []).map((item) => ({
      id: item.id,
      type: item.mimeType,
      url: item.fileUrl,
      fileName: item.fileName,
      description: item.description ?? null,
      takenAt: item.createdAt,
    }));
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
  private buildTimeline(
    treatmentSessions: TreatmentSession[],
  ): TimelineEntryDto[] {
    return treatmentSessions.map((session) => ({
      sessionId: session.id,

      title: session.title,

      status: session.status,

      appointmentDate: session.clinicalAppointment
        ? this.toDateString(session.clinicalAppointment.appointmentDate)
        : null,

      startTime: session.clinicalAppointment?.appointmentStart ?? null,
    }));
  }
  private buildSupervisorNotes(
    treatmentSessions: TreatmentSession[],
  ): SupervisorNoteDto[] {
    return treatmentSessions
      .filter(
        (session) =>
          session.supervisorNotes !== null &&
          session.supervisorNotes?.trim() !== '',
      )
      .map((session) => ({
        sessionId: session.id,
        sessionTitle: session.title,
        supervisor:
          session.clinicalAppointment?.supervisor?.user?.full_name ?? null,
        // Emit the raw Date (serialized to ISO) — a server-locale string is
        // not parseable by clients.
        createdAt: session.updatedAt,
        notes: session.supervisorNotes as string,
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
  /**
   * The patient's own cases. Scoped by the user behind the patient record, the
   * same ownership rule the details route uses. A patient with no cases yet is
   * a normal state, so this returns an empty list rather than a 404.
   */
  async findPatientCases(userId: number): Promise<PatientCasesSummaryDto> {
    const clinicalCases = await this.clinicalCaseRepository.find({
      where: { patient: { user: { id: userId } } },
      relations: {
        subject: true,
        treatmentSessions: true,
        clinicalAppointments: true,
        assignedStudent: { user: true },
        assignedSupervisor: { user: true },
      },
      order: { createdAt: 'DESC' },
    });

    const cases = clinicalCases.map((clinicalCase) => {
      const nextAppointment = this.findNextScheduledAppointment(clinicalCase);
      return {
        id: clinicalCase.id,
        subject: clinicalCase.subject.name,
        status: clinicalCase.status,
        treatingStudent: clinicalCase.assignedStudent?.user?.full_name ?? null,
        supervisor: clinicalCase.assignedSupervisor?.user?.full_name ?? null,
        sessionCount: clinicalCase.treatmentSessions.length,
        nextSession: nextAppointment
          ? {
              id: nextAppointment.id,
              appointmentDate: this.toDateString(
                nextAppointment.appointmentDate,
              ),
              startTime: nextAppointment.appointmentStart,
            }
          : null,
        createdAt: clinicalCase.createdAt,
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
