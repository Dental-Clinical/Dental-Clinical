import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalCase } from './clinical-case.entity';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { CreateClinicalCaseDto } from './dto/create-clinical-case.dto';
import { InitialExamination } from 'src/initial-examination/initial-examination.entity';
import { InitialExaminationStatus } from 'src/initial-examination/enums/initial-examination-status.enum';
import { ClinicalCaseStatus } from './enums/clinical-case-status.enum';
import { ClinicalCaseStateMachine } from './state-machine/clinical-case-state-machine';
import { UpdateClinicalCaseStatusDto } from './dto/update-clinical-case-status.dto';
import { ClinicalCaseSummaryDto } from './dto/clinical-case-summary.dto';
import {
  AssignedClinicalCaseDetailsDto,
  ClinicalCaseDetailsDto,
  toGender,
} from './dto/clinical-case-details.sto';
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
import { Subject } from 'src/subjects/subjects.entity';
import { UserRole } from 'src/constants/user-roles';
import {
  CASE_VIEW_POLICY,
  CaseViewerRole,
  CaseViewPolicy,
} from './case-view.policy';
import {
  CaseDetailsViewDto,
  CaseEvaluationDto,
  CaseInfoDto,
  CaseMediaDto,
  SupervisorNoteDto,
  TimelineEntryDto,
  TreatmentPlanDto,
} from './dto/case-details-view.dto';
import { CreateWalkInClinicalCaseDto } from './dto/create-walk-in-clinical-case.dto';
import { PatientsService } from 'src/patients/patients.service';
import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { SubjectDiagnosisQuestion } from 'src/subject-diagnosis/subject-diagnosis-questions.entity';
import { DiagnosisSubmissionService } from 'src/diagnosis-submission/diagnosis-submission.service';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { SubjectDiagnosisAnswer } from 'src/subject-diagnosis/subject-diagnosis-answers.entity';
import { SupervisorAvailabilityService } from 'src/clinical-appointments/supervisor-availability.service';
import { DiagnosisSubmissionStatus } from 'src/diagnosis-submission/enums/diagnosis-submission-status.enum';
import { DiagnosisImages } from 'src/diagnosis-images/diagnosis-images.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { unlink } from 'fs/promises';
import { UploadApiResponse } from 'cloudinary';
import { CreateClinicalCaseForExistingPatientDto } from './dto/create-clinical-case-for-existing-patient.dto';
import { InitialExaminationService } from 'src/initial-examination/initial-examination.service';

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
    private readonly patientService: PatientsService,
    private readonly supervisorAvailibilityService: SupervisorAvailabilityService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => InitialExaminationService))
    private readonly initialExaminationService: InitialExaminationService,
  ) {}
  public async createClinicalCaseForExistingPatient(
    userId: number,
    dto: CreateClinicalCaseForExistingPatientDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const patient = await manager.findOne(Patient, {
        where: {
          id: dto.patientId,
        },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const subject = await manager.findOne(Subject, {
        where: {
          id: dto.subjectId,
        },
      });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      const examinationRequest = manager
        .getRepository(ExaminationRequest)
        .create({
          chief_complaint: dto.chiefComplaint,
          symptoms: dto.symptoms,
          patient,
        });
      await manager.getRepository(ExaminationRequest).save(examinationRequest);

      const examination =
        await this.initialExaminationService.createInitialExamination(
          userId,
          {
            request_id: examinationRequest.id,
            patient_id: patient.id,
            subject_id: subject.id,
            clinicalFindings: dto.clinicalFindings,
            diagnosis: dto.diagnosis,
          },
          manager,
        );
    });
  }
  public async createWalkInClinicalCase(
    userId: number,
    dto: CreateWalkInClinicalCaseDto,
    files: Express.Multer.File[],
  ) {
    let uploadedImages: UploadApiResponse[] = [];
    try {
      return this.dataSource.transaction(async (manager) => {
        const examinationRepo = manager.getRepository(ExaminationRequest);
        const clinicalCaseRepo = manager.getRepository(ClinicalCase);
        const clinicalAppointmentRepo =
          manager.getRepository(ClinicalAppointment);
        const subjectRepo = manager.getRepository(Subject);
        const subjectProcedureRepo = manager.getRepository(SubjectProcedures);
        const diagnosisSubmissionRepo =
          manager.getRepository(DiagnosisSubmission);
        const subjectDiagnosisQuestionRepo = manager.getRepository(
          SubjectDiagnosisQuestion,
        );
        const procedureRepository = manager.getRepository(PlannedProcedures);
        const answerRepository = manager.getRepository(SubjectDiagnosisAnswer);

        const student = await this.studentService.findByUserId(userId, manager);
        if (!student) {
          throw new NotFoundException('Student not found');
        }
        const studentStudyYear = await this.studentService.getCurrentStudyYear(
          userId,
          manager,
        );

        const patient = await this.patientService.createPatient(
          dto.patient.patientInfo,
          manager,
        );
        const examination = examinationRepo.create({
          chief_complaint: dto.patient.chiefComplaint,
          symptoms: dto.patient.symptoms,
          patient,
          status: ExaminationRequestStatus.CONVERTED_TO_CASE,
        });
        await examinationRepo.save(examination);
        const subject = await subjectRepo.findOne({
          where: {
            id: dto.caseInfo.subjectId,
          },
        });
        if (!subject) {
          throw new NotFoundException('Subject not found');
        }
        if (studentStudyYear.id !== subject.study_year_id) {
          throw new ConflictException(
            'Student is not eligible for this subject study year',
          );
        }
        const sectionSubject =
          await this.studentService.getSectionSubjectForStudent(
            userId,
            subject.id,
            manager,
          );
        const supervisor = sectionSubject.supervisor;
        const subjectProcedureIds = dto.caseInfo.plannedProcedures.map(
          (procedure) => procedure.subjectProcedureId,
        );
        const subjectProcedures = await subjectProcedureRepo.find({
          where: {
            id: In(subjectProcedureIds),
            subject: { id: subject.id },
            is_active: true,
          },
        });

        if (subjectProcedures.length !== subjectProcedureIds.length) {
          throw new ConflictException(
            'One or more planned procedures do not belong to this subject.',
          );
        }
        const questions = await subjectDiagnosisQuestionRepo.find({
          where: {
            subject: { id: subject.id },
            isActive: true,
          },
          relations: {
            answerOptions: true,
          },
        });
        const questionById = new Map(
          questions.map((question) => [question.id, question]),
        );
        for (const procedure of dto.caseInfo.plannedProcedures) {
          DiagnosisSubmissionService.validateProcedureAnswers(
            procedure,
            questions,
            questionById,
          );
        }
        const clinicalCase = clinicalCaseRepo.create({
          patient,
          assignedStudent: student,
          subject,
          assignedSupervisor: supervisor,
          request: examination,
          status: ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW,
        });
        const savedCase = await clinicalCaseRepo.save(clinicalCase);
        const diagnosisSubmission = diagnosisSubmissionRepo.create({
          clinicalCase: savedCase,
          supervisor,
          student,
          status: DiagnosisSubmissionStatus.PENDING_REVIEW,
        });
        const savedSubmission =
          await diagnosisSubmissionRepo.save(diagnosisSubmission);

        const savedProcedures: PlannedProcedures[] = [];
        const savedAnswers: SubjectDiagnosisAnswer[] = [];

        for (const procedure of dto.caseInfo.plannedProcedures) {
          const plannedProcedure = procedureRepository.create({
            diagnosisSubmission: savedSubmission,
            clinicalCase: savedCase,
            subjectProcedure: { id: procedure.subjectProcedureId },
            toothNumber: procedure.toothNumber,
            notes: procedure.notes?.trim() ?? null,
          });
          const savedProcedure =
            await procedureRepository.save(plannedProcedure);
          savedProcedures.push(savedProcedure);

          for (const answer of procedure.answers) {
            const subjectQuestion = questionById.get(answer.questionId);
            if (!subjectQuestion) {
              throw new ConflictException(
                `Question with ID ${answer.questionId} is not an active question for this subject`,
              );
            }
            const activeOptions = subjectQuestion.answerOptions.filter(
              (option) => option.isActive,
            );
            const requestedOptionIds = answer.optionIds ?? [];

            const selectedOptions = activeOptions.filter((option) =>
              requestedOptionIds.includes(option.id),
            );

            if (selectedOptions.length !== requestedOptionIds.length) {
              throw new BadRequestException(
                `One or more selected options are invalid for question ID ${subjectQuestion.id}`,
              );
            }
            const diagnosisAnswer = answerRepository.create({
              plannedProcedure: savedProcedure,
              question: { id: answer.questionId },
              answer: answer.answer?.trim() ?? null,
              selectedOptions,
            });
            const savedAnswer = await answerRepository.save(diagnosisAnswer);
            savedAnswers.push(savedAnswer);
          }
          if (files?.length) {
            uploadedImages = await this.cloudinaryService.uploadMany(
              files,
              'diagnosis-submissions',
            );
            const images = uploadedImages.map((image, index) =>
              manager.getRepository(DiagnosisImages).create({
                diagnosisSubmission: savedSubmission,
                publicId: image.public_id,
                fileUrl: image.secure_url,
                fileName: files[index].originalname,
                mimeType: files[index].mimetype,
              }),
            );
            await manager.getRepository(DiagnosisImages).save(images);
          }
        }
        const { startTime, endTime } =
          await this.supervisorAvailibilityService.validateSlotAvailability(
            new Date(dto.appointment.appointmentDate),
            dto.appointment.appointmentStart,
            supervisor.id,
            manager,
          );

        const appointment = clinicalAppointmentRepo.create({
          clinicalCase: savedCase,
          supervisor,
          patient,
          student,
          appointmentDate: dto.appointment.appointmentDate,
          appointmentStart: startTime,
          appointmentEnd: endTime,
          status: ClinicalAppointmentStatus.SCHEDULED,
        });

        await clinicalAppointmentRepo.save(appointment);
        return {
          message: 'Case created successfully waiting for appointment',
        };
      });
    } catch (err) {
      await Promise.all([
        ...(uploadedImages ?? []).map((image) =>
          this.cloudinaryService.delete(image.public_id).catch(() => {}),
        ),
        ...(files ?? []).map((file) => unlink(file.path).catch(() => {})),
      ]);

      throw err;
    }
  }
  private async create(dto: CreateClinicalCaseDto, manager: EntityManager) {
    const initialExamination = await manager.findOne(InitialExamination, {
      where: { id: dto.initialExaminationId },
      relations: {
        clinicalCase: true,
        patient: true,
        request: true,
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

    const subject = await manager.findOneBy(Subject, { id: dto.subjectId });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const clinicalCase = manager.getRepository(ClinicalCase).create({
      initialExamination: initialExamination,
      patient: initialExamination.patient,
      request: initialExamination.request,
      subject,
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
        requiresDentalChart: clinicalCase.subject.requiresDentalChart,
      },
      assignedStudent: clinicalCase.assignedStudent
        ? {
            id: clinicalCase.assignedStudent.id,
            name: clinicalCase.assignedStudent.user.full_name,
            phone: clinicalCase.assignedStudent.user.phone,
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
        initialExamination: true,
        subject: true,
        clinicalAppointments: true,
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
        gender: toGender(clinicalCase.patient.gender),
        dateOfBirth: clinicalCase.patient.dateOfBirth
          ? DateTimeUtils.toDateString(clinicalCase.patient.dateOfBirth)
          : null,
        allergies: clinicalCase.patient.allergies,
        medicalHistory: clinicalCase.patient.medical_history,
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
        requiresDentalChart: clinicalCase.subject.requiresDentalChart,
      },
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
        assignedSupervisor: {
          user: true,
        },
        clinicalAppointments: true,
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
    const sectionSubject =
      await this.studentService.getSectionSubjectForStudent(
        userId,
        clinicalCase?.subject.id,
      );
    const section = sectionSubject.section;
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
        gender: clinicalCase.patient.gender,
        dateOfBirth: clinicalCase.patient.dateOfBirth,
      },

      patientRequest: {
        id: clinicalCase.request.id,
        chiefComplaint: clinicalCase.request.chief_complaint,
        symptoms: clinicalCase.request.symptoms,
      },

      subject: {
        id: clinicalCase.subject.id,
        name: clinicalCase.subject.name,
        requiresDentalChart: clinicalCase.subject.requiresDentalChart,
      },

      assignedStudent: {
        id: clinicalCase.assignedStudent.id,
        name: clinicalCase.assignedStudent.user.full_name,
      },
      assignedSupervisor: {
        id: clinicalCase.assignedSupervisor.id,
        name: clinicalCase.assignedSupervisor.user.full_name,
        section,
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
        request: true,
        subject: true,
        media: true,
        evaluation: true,
        plannedProcedures: {
          subjectProcedure: true,
          answers: {
            question: true,
            selectedOptions: true,
          },
        },
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
        relations: {
          plannedProcedures: {
            subjectProcedure: true,
            answers: { selectedOptions: true, question: true },
          },
        },
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
      treatmentPlan: this.buildTreatmentPlan(clinicalCase),
      materials: this.buildMaterials(sessionMaterials),
      caseMedia: this.buildCaseMedia(clinicalCase.media),
      timeline: this.buildTimeline(treatmentSessions),
      ...(policy.includeSupervisorNotes
        ? { supervisorNotes: this.buildSupervisorNotes(treatmentSessions) }
        : {}),
      ...(policy.includePatientInformation
        ? {
            patientInformation: this.buildPatientInformation(
              clinicalCase.request,
              clinicalCase.patient,
            ),
          }
        : {}),
      ...(policy.includeEvaluation
        ? { evaluation: this.buildEvaluation(clinicalCase) }
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

      subject: {
        id: clinicalCase.subject.id,
        name: clinicalCase.subject.name,
        requiresDentalChart: clinicalCase.subject.requiresDentalChart,
      },

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
    clinicalCase: ClinicalCase | null,
  ): TreatmentPlanDto {
    const treatmentPlan =
      clinicalCase?.plannedProcedures?.map((procedure) => {
        return {
          procedureId: procedure.id,
          procedure: procedure.subjectProcedure.name,
          tooth: procedure.toothNumber,
          notes: procedure.notes,
          status: procedure.status,
          answers: procedure.answers.map((answer) => ({
            question: answer.question.question,
            answer: answer.answer,
            selectedOptions:
              answer.selectedOptions.map((option) => ({
                id: option.id,
                label: option.label,
              })) ?? [],
          })),
        };
      }) ?? [];
    return { targetTeeth: treatmentPlan };
  }
  private buildCaseMedia(media: ClinicalCaseMedia[]): CaseMediaDto[] {
    return (media ?? []).map((item) => ({
      id: item.id,
      url: item.fileUrl,
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
  /**
   * A case is only evaluated once the supervisor grades it, so the relation is
   * absent for every case still under treatment.
   */
  private buildEvaluation(
    clinicalCase: ClinicalCase,
  ): CaseEvaluationDto | null {
    const evaluation = clinicalCase.evaluation;
    if (!evaluation) {
      return null;
    }
    return {
      id: evaluation.id,
      grade: evaluation.grade,
      comment: evaluation.comment ?? null,
      createdAt: evaluation.createdAt,
    };
  }
  private buildPatientInformation(
    request: ExaminationRequest,
    patient: Patient,
  ) {
    return {
      chiefComplaint: request.chief_complaint,
      medicalHistory: patient.medical_history,
      allergies: patient.allergies,
      medications: patient.current_medications,
    };
  }
  async findStudentCases(userId: number): Promise<StudentCasesSummaryDto> {
    // approved
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCases = await this.clinicalCaseRepository.find({
      where: {
        assignedStudent: { id: student.id },
        status: Not(ClinicalCaseStatus.ASSIGNED),
      },
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
        subject: {
          id: clinicalCase.subject.id,
          name: clinicalCase.subject.name,
          requiresDentalChart: clinicalCase.subject.requiresDentalChart,
        },
        status: clinicalCase.status,
        sessionCount:
          clinicalCase.treatmentSessions.length == 0
            ? null
            : clinicalCase.treatmentSessions.length,
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
        subject: { clinic: true },
        request: true,
        initialExamination: { coordinator: { user: true } },
      },
    });
    const result = openCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patient: clinicalCase.patient.full_name,
        subject: {
          id: clinicalCase.subject.id,
          name: clinicalCase.subject.name,
          requiresDentalChart: clinicalCase.subject.requiresDentalChart,
        },
        clinic: clinicalCase.subject.clinic,
        coordinator:
          clinicalCase.initialExamination?.coordinator?.user?.full_name ?? null,
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
  async findAssignedCases(
    userId: number,
  ): Promise<AssignedClinicalCaseDetailsDto[]> {
    const student = await this.studentService.findByUserId(userId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    // A subject no longer knows its section — that depends on which section the
    // student takes it in, so it comes from their enrolments. Fetched once
    // rather than per case.
    const sectionsBySubjectId =
      await this.studentService.getSectionsBySubjectId(userId);

    const assignedCases = await this.clinicalCaseRepository.find({
      where: {
        assignedStudent: { id: student.id },
        status: ClinicalCaseStatus.ASSIGNED,
      },
      relations: {
        patient: true,
        subject: true,
        assignedStudent: true,
        request: true,
        clinicalAppointments: true,
      },
    });
    const result = assignedCases.map((clinicalCase) => {
      const nextAppointment = clinicalCase.clinicalAppointments
        .filter((a) => a.status === ClinicalAppointmentStatus.SCHEDULED)
        .sort(
          (a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime(),
        )[0];
      return {
        id: clinicalCase.id,
        status: clinicalCase.status,
        patient: clinicalCase.patient.full_name,
        subject: {
          id: clinicalCase.subject.id,
          name: clinicalCase.subject.name,
          requiresDentalChart: clinicalCase.subject.requiresDentalChart,
        },
        section: sectionsBySubjectId.get(clinicalCase.subject.id)?.name ?? null,
        chiefComplaint: clinicalCase.request.chief_complaint,
        nextAppointment: nextAppointment
          ? {
              appointmentDate: nextAppointment.appointmentDate,
              appointmentStart: nextAppointment.appointmentStart,
            }
          : null,
        createdAt: clinicalCase.createdAt,
      };
    });
    return result;
  }
  async findStudentCasesInSubject(userId: number, subjectId: number) {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCases = await this.clinicalCaseRepository.find({
      where: {
        assignedStudent: { id: student.id },
        subject: { id: subjectId },
      },
      relations: {
        patient: true,
        subject: true,
        treatmentSessions: true,
      },
    });
    const cases = clinicalCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patientName: clinicalCase.patient.full_name,
        subjectName: clinicalCase.subject.name,
        status: clinicalCase.status,
        sessionCount:
          clinicalCase.treatmentSessions.length > 0
            ? clinicalCase.treatmentSessions.length
            : null,
      };
    });
    return cases;
  }
  public async createFromInitialExamination(
    initialExaminationId: number,
    subjectId: number,
    manager: EntityManager,
  ) {
    return await this.create({ initialExaminationId, subjectId }, manager);
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

  public async cancelClinicalCase(userId: number, id: number) {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return await this.dataSource.transaction(async (manager) => {
      // const clinicalCase = await manager.getRepository(ClinicalCase).findOne({
      //   where: { id },
      //   relations: { assignedStudent: true },
      // });
      const lockedclinicalCase = await manager
        .getRepository(ClinicalCase)
        .createQueryBuilder('clinicalCase')
        .setLock('pessimistic_write')
        // .leftJoinAndSelect('clinicalCase.assignedStudent', 'student')
        .where('clinicalCase.id = :id', { id })
        .getOne();

      const clinicalCase = await manager.getRepository(ClinicalCase).findOne({
        where: { id: lockedclinicalCase?.id },
        relations: { assignedStudent: true },
      });

      if (!clinicalCase) {
        throw new NotFoundException('Clinical case not found');
      }

      if (clinicalCase.status !== ClinicalCaseStatus.ASSIGNED) {
        throw new ConflictException(
          'Only an assigned clinical case can be cancelled',
        );
      }

      if (clinicalCase.assignedStudent?.id !== student.id) {
        throw new ForbiddenException(
          "You're not authorized to cancel this case",
        );
      }
      const appointment = await manager
        .getRepository(ClinicalAppointment)
        .createQueryBuilder('appointment')
        .setLock('pessimistic_write')
        .where('appointment.clinicalCaseId = :id', { id })
        .andWhere('appointment.status = :status', {
          status: ClinicalAppointmentStatus.SCHEDULED,
        })
        .getOne();
      // const appointment = await manager
      //   .getRepository(ClinicalAppointment)
      //   .findOne({
      //     where: {
      //       clinicalCase: { id },
      //       status: ClinicalAppointmentStatus.SCHEDULED,
      //     },
      //   });
      if (!appointment) {
        throw new ConflictException(
          'No scheduled appointment found for this clinical case',
        );
      }
      // const now = new Date();
      // if (
      //   appointment.appointmentDate.getTime() >
      //   now.getTime() + 24 * 60 * 60 * 1000
      // ) {
      //   throw new ConflictException(
      //     'Cannot cancel a clinical case with a scheduled appointment in the future',
      //   );
      // }
      const now = new Date();
      const appointmentDateTime = DateTimeUtils.combine(
        appointment.appointmentDate,
        appointment.appointmentStart,
      );

      if (now < appointmentDateTime) {
        throw new ConflictException(
          'The clinical case can only be cancelled after the scheduled appointment time.',
        );
      }
      appointment.status = ClinicalAppointmentStatus.CANCELLED;
      await manager.getRepository(ClinicalAppointment).save(appointment);

      await manager.getRepository(ClinicalCase).update(id, {
        status: ClinicalCaseStatus.OPEN,
        assignedStudent: () => 'NULL',
        assignedSupervisor: () => 'NULL',
      });

      return {
        message: 'Cancelled successfully',
      };
    });
  }
}
