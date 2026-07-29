import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentService } from 'src/students/student.service';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import { CreateTreatmentSessionDto } from './dto/create-treatment-sessions.dto';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { TreatmentSession } from './treatment-sessions.entity';
import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';
import { TreatmentSessionStatus } from './enums/treatment-session-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { SessionProcedure } from 'src/sesssion-procedures/session-procedures.entity';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { CompleteTreatmentSessionDto } from './dto/complete-treatment-session.dto';
import { Material } from 'src/materials/materials.entity';
import { SupervisorAvailabilityService } from 'src/clinical-appointments/supervisor-availability.service';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { PerformedProceduresDto } from './dto/performed-procedures.dto';
import { Student } from 'src/students/student.entity';
import { SupervisorService } from 'src/supervisors/supervisor.service';
import { ReviewTreatmentSessionDto } from './dto/review-treatment-session.dto';

@Injectable()
export class TreatmentSessionsService {
  constructor(
    private readonly studentService: StudentService,
    private readonly supervisorService: SupervisorService,
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    @InjectRepository(TreatmentSession)
    private readonly treatmentSessionRepository: Repository<TreatmentSession>,
    @InjectRepository(DiagnosisSubmission)
    private readonly diagnosisSubmissionRepository: Repository<DiagnosisSubmission>,
    @InjectRepository(SessionProcedure)
    private readonly sessionProcedureRepository: Repository<SessionProcedure>,
    @InjectRepository(PlannedProcedures)
    private readonly plannedProceduresRepository: Repository<PlannedProcedures>,
    private readonly datasource: DataSource,
    private readonly supervisorAvailabilityService: SupervisorAvailabilityService,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}
  public async createTreatmentSession(
    userId: number,
    dto: CreateTreatmentSessionDto,
  ) {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id: dto.clinicalCaseId },
      relations: {
        assignedStudent: true,
      },
    });

    if (!clinicalCase) {
      throw new NotFoundException('Clinical case not found');
    }
    if (clinicalCase.assignedStudent.id !== student.id) {
      throw new ConflictException('Clinical case not assigned to this student');
    }
    if (clinicalCase.status !== ClinicalCaseStatus.TREATMENT_IN_PROGRESS) {
      throw new ConflictException(
        'Clinical case status is not TREATMENT_IN_PROGRESS',
      );
    }

    return await this.datasource.transaction(async (manager) => {
      await manager.getRepository(ClinicalCase).findOne({
        where: { id: clinicalCase.id },
        lock: {
          mode: 'pessimistic_write',
        },
      });
      const lockedClinicalCase = await manager
        .getRepository(ClinicalCase)
        .findOne({
          where: { id: clinicalCase.id },
          relations: {
            assignedStudent: true,
            assignedSupervisor: true,
            patient: true,
            clinicalAppointments: {
              treatmentSession: true,
            },
          },
        });

      if (!lockedClinicalCase) {
        throw new NotFoundException('Clinical case not found');
      }

      const activeSession = await manager
        .getRepository(TreatmentSession)
        .exists({
          where: {
            clinicalCase: { id: lockedClinicalCase.id },
            status: TreatmentSessionStatus.ACTIVE,
          },
        });

      if (activeSession) {
        throw new ConflictException(
          'There is already an active treatment session.',
        );
      }
      const existingSession = await manager
        .getRepository(TreatmentSession)
        .exists({
          where: {
            clinicalCase: { id: lockedClinicalCase.id },
          },
        });

      const isFirstSession = !existingSession;

      let appointment: ClinicalAppointment | undefined;
      if (isFirstSession) {
        appointment = lockedClinicalCase.clinicalAppointments.find(
          (a) =>
            a.status == ClinicalAppointmentStatus.COMPLETED &&
            !a.treatmentSession,
        );
      } else {
        if (!dto.appointmentDate || !dto.appointmentStart) {
          throw new ConflictException(
            'Appointment date and start time are required for subsequent treatment sessions.',
          );
        }
        const { startTime, endTime } =
          await this.supervisorAvailabilityService.validateSlotAvailability(
            new Date(dto.appointmentDate),
            dto.appointmentStart,
            lockedClinicalCase.assignedSupervisor.id,
            manager,
          );
        appointment = manager.getRepository(ClinicalAppointment).create({
          appointmentDate: new Date(dto.appointmentDate),
          appointmentStart: startTime,
          appointmentEnd: endTime,
          status: ClinicalAppointmentStatus.SCHEDULED,
          clinicalCase: lockedClinicalCase,
          student: student,
          patient: lockedClinicalCase.patient,
          supervisor: lockedClinicalCase.assignedSupervisor,
        });
        await manager.getRepository(ClinicalAppointment).save(appointment);
      }

      if (!appointment) {
        throw new ConflictException(
          isFirstSession
            ? 'No examination appointment found for this clinical case.'
            : 'Appointment could not be created for the treatment session.',
        );
      }

      const session = manager.getRepository(TreatmentSession).create({
        title: dto.title,
        clinicalCase: lockedClinicalCase,
        clinicalAppointment: appointment,
        status: isFirstSession
          ? TreatmentSessionStatus.ACTIVE
          : TreatmentSessionStatus.UPCOMING,
      });
      await manager.getRepository(TreatmentSession).save(session);
      return manager.getRepository(TreatmentSession).findOne({
        where: { id: session.id },
        relations: {
          clinicalCase: true,
          clinicalAppointment: true,
        },
      });
    });
  }
  public async getTreatmentSessionProcedures(
    userId: number,
    treatmentSessionId: number,
  ) {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const treatmentSession = await this.treatmentSessionRepository.findOne({
      where: { id: treatmentSessionId },
      relations: {
        clinicalCase: { assignedStudent: true },
      },
    });
    if (!treatmentSession) {
      throw new NotFoundException('Treatment session not found');
    }
    if (treatmentSession.clinicalCase.assignedStudent.id !== student.id) {
      throw new ConflictException(
        'Treatment session does not belong to this student',
      );
    }
    if (treatmentSession.status !== TreatmentSessionStatus.ACTIVE) {
      throw new ConflictException('Treatment session is not active.');
    }
    const submission = await this.diagnosisSubmissionRepository.findOne({
      where: {
        clinicalCase: {
          id: treatmentSession.clinicalCase.id,
        },
      },
      relations: {
        plannedProcedures: { subjectProcedure: true },
      },
    });
    if (!submission) {
      throw new NotFoundException(
        'Diagnosis submission not found for this clinical case',
      );
    }

    const totalProcedures = submission.plannedProcedures.length;
    const completedProcedures = submission.plannedProcedures.filter(
      (procedure) => procedure.status === PlannedProceduresStatus.COMPLETED,
    ).length;

    return {
      treatmentSessionId: treatmentSession.id,
      clinicalCaseId: treatmentSession.clinicalCase.id,
      progress: {
        completed: completedProcedures,
        total: totalProcedures,
        percentage:
          totalProcedures > 0
            ? (completedProcedures / totalProcedures) * 100
            : 0,
      },
      procedures: submission?.plannedProcedures.map((procedure) => ({
        plannedProcedureId: procedure.id,
        name: procedure.subjectProcedure.name,
        toothNumber: procedure.toothNumber,
        status: procedure.status,
      })),
    };
  }
  public async completeTreatmentSession(
    userId: number,
    treatmentSessionId: number,
    dto: CompleteTreatmentSessionDto,
  ) {
    // Fetch and validate student
    const student = await this.validateAndGetStudent(userId);

    // Fetch and validate treatment session with all relations
    const treatmentSession = await this.validateAndGetTreatmentSession(
      treatmentSessionId,
      student.id,
    );

    // Validate procedures
    const plannedProcedures = await this.validateProcedures(
      dto.performedProcedures,
      treatmentSession.clinicalCase.id,
    );

    // Validate materials
    await this.validateMaterials(
      dto.materials || [],
      treatmentSession.clinicalCase.subject.id,
    );

    // Execute transaction
    return await this.executeCompletionTransaction(
      treatmentSession,
      dto,
      plannedProcedures,
    );
  }
  public async reviewTreatmentSession(
    userId: number,
    treatmentSessionId: number,
    dto: ReviewTreatmentSessionDto,
  ) {
    const superivsor = await this.supervisorService.findByUserId(userId);

    if (!superivsor) {
      throw new NotFoundException('Supervisor not found');
    }

    const treatmentSession = await this.treatmentSessionRepository.findOne({
      where: { id: treatmentSessionId },
      relations: {
        clinicalCase: { assignedSupervisor: true },
      },
    });

    if (!treatmentSession) {
      throw new NotFoundException('Treatment session not found');
    }
    if (treatmentSession.clinicalCase.assignedSupervisor.id != superivsor.id) {
      throw new ConflictException(
        'Treatment session does not belong to this supervisor',
      );
    }

    if (treatmentSession.status !== TreatmentSessionStatus.COMPLETED) {
      throw new ConflictException(
        'Treatment session is not completed and cannot be reviewed.',
      );
    }
    if (treatmentSession.supervisorNotes) {
      throw new ConflictException(
        'Treatment session has already been reviewed.',
      );
    }

    treatmentSession.supervisorNotes = dto.supervisorNotes;
    await this.treatmentSessionRepository.save(treatmentSession);
    return {
      message: 'Treatment session reviewed successfully.',
      treatmentSessionId: treatmentSession.id,
      supervisorNotes: treatmentSession.supervisorNotes,
    };
  }
  private async prepareSessionMaterials(
    manager: EntityManager,
    treatmentSession: TreatmentSession,
    materials: { materialId: number }[],
  ) {
    const sessionMaterials = materials.map((material) =>
      manager.getRepository(SessionMaterial).create({
        material: { id: material.materialId } as Material,
        treatmentSession,
      }),
    );
    return sessionMaterials;
  }
  private async prepareSessionProcedures(
    plannedProcedures: PlannedProcedures[],
    performedProcedures: PerformedProceduresDto[],
    treatmentSession: TreatmentSession,
    manager: EntityManager,
  ) {
    const plannedProcedureMap = new Map(
      plannedProcedures.map((procedure) => [procedure.id, procedure]),
    );

    const updatedProcedures: PlannedProcedures[] = [];
    const sessionProcedures: SessionProcedure[] = [];

    for (const performedProcedure of performedProcedures) {
      const plannedProcedure = plannedProcedureMap.get(
        performedProcedure.plannedProcedureId,
      );

      if (!plannedProcedure) {
        throw new NotFoundException(
          `Planned procedure with ID ${performedProcedure.plannedProcedureId} not found.`,
        );
      }

      if (
        performedProcedure.status &&
        plannedProcedure.status === PlannedProceduresStatus.COMPLETED
      ) {
        throw new ConflictException(
          `Planned procedure with ID ${plannedProcedure.id} has already been completed and cannot be recorded again.`,
        );
      }

      if (performedProcedure.status === PlannedProceduresStatus.COMPLETED) {
        plannedProcedure.status = PlannedProceduresStatus.COMPLETED;
        updatedProcedures.push(plannedProcedure);
      }
      if (performedProcedure.status === PlannedProceduresStatus.IN_PROGRESS) {
        plannedProcedure.status = PlannedProceduresStatus.IN_PROGRESS;
        updatedProcedures.push(plannedProcedure);
      }

      sessionProcedures.push(
        manager.getRepository(SessionProcedure).create({
          treatmentSession,
          plannedProcedure,
        }),
      );
    }
    return { updatedProcedures, sessionProcedures };
  }

  // 1. STUDENT VALIDATION
  private async validateAndGetStudent(userId: number): Promise<Student> {
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  // 2. TREATMENT SESSION VALIDATION
  private async validateAndGetTreatmentSession(
    treatmentSessionId: number,
    studentId: number,
  ): Promise<TreatmentSession> {
    const treatmentSession = await this.treatmentSessionRepository.findOne({
      where: { id: treatmentSessionId },
      relations: {
        clinicalCase: {
          assignedStudent: true,
          subject: true,
          assignedSupervisor: true,
          patient: true,
          clinicalAppointments: { treatmentSession: true },
        },
      },
    });

    if (!treatmentSession) {
      throw new NotFoundException('Treatment session not found');
    }

    // Check ownership
    if (treatmentSession.clinicalCase.assignedStudent.id !== studentId) {
      throw new ConflictException(
        'Treatment session does not belong to this student',
      );
    }

    // Check status
    if (treatmentSession.status !== TreatmentSessionStatus.ACTIVE) {
      throw new ConflictException('Treatment session is not active.');
    }

    return treatmentSession;
  }

  // 3. PROCEDURES VALIDATION
  private async validateProcedures(
    performedProcedures: PerformedProceduresDto[],
    clinicalCaseId: number,
  ): Promise<PlannedProcedures[]> {
    // Check for duplicates
    const procedureIds = performedProcedures.map(
      (procedure) => procedure.plannedProcedureId,
    );

    if (new Set(procedureIds).size !== procedureIds.length) {
      throw new ConflictException('Duplicate planned procedures found.');
    }

    // Fetch planned procedures
    const plannedProcedures = await this.plannedProceduresRepository.find({
      where: {
        id: In(procedureIds),
      },
      relations: {
        diagnosisSubmission: {
          clinicalCase: true,
        },
      },
    });

    // Check all exist
    if (plannedProcedures.length !== procedureIds.length) {
      throw new NotFoundException(
        'One or more planned procedures were not found.',
      );
    }

    // Check all belong to clinical case
    for (const procedure of plannedProcedures) {
      if (
        !procedure.diagnosisSubmission ||
        procedure.diagnosisSubmission.clinicalCase.id !== clinicalCaseId
      ) {
        throw new ConflictException(
          'One or more planned procedures do not belong to the clinical case.',
        );
      }
    }

    return plannedProcedures;
  }

  // 4. MATERIALS VALIDATION
  private async validateMaterials(
    materials: { materialId: number }[],
    subjectId: number,
  ): Promise<void> {
    if (!materials || materials.length === 0) {
      return;
    }

    // Check for duplicates
    const materialIds = materials.map((m) => m.materialId);
    if (new Set(materialIds).size !== materialIds.length) {
      throw new ConflictException('Duplicate materials found.');
    }

    // Fetch materials
    const existingMaterials = await this.materialRepository.find({
      where: { id: In(materialIds) },
      relations: { subjects: true },
    });

    // Check all exist
    if (existingMaterials.length !== materialIds.length) {
      throw new NotFoundException('One or more materials not found.');
    }

    // Check all belong to subject
    for (const material of existingMaterials) {
      if (!material.subjects.some((s) => s.id === subjectId)) {
        throw new ConflictException(
          `Material with ID ${material.id} is not associated with the subject of the clinical case.`,
        );
      }
    }
  }

  // 5. SESSION PROCEDURES VALIDATION
  private async validateSessionHasProcedures(
    treatmentSessionId: number,
  ): Promise<void> {
    const hasProcedures = await this.sessionProcedureRepository.exists({
      where: {
        treatmentSession: { id: treatmentSessionId },
      },
    });

    if (!hasProcedures) {
      throw new ConflictException(
        'At least one performed procedure must be recorded before completing the treatment session.',
      );
    }
  }

  // 6. TRANSACTION EXECUTION
  private async executeCompletionTransaction(
    treatmentSession: TreatmentSession,
    dto: CompleteTreatmentSessionDto,
    plannedProcedures: PlannedProcedures[],
  ) {
    return await this.datasource.transaction(async (manager) => {
      // Lock the session for update
      await manager.getRepository(TreatmentSession).findOne({
        where: { id: treatmentSession.id },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      // Prepare and save session materials
      const sessionMaterials = await this.prepareSessionMaterials(
        manager,
        treatmentSession,
        dto.materials ?? [],
      );
      if (sessionMaterials && sessionMaterials.length > 0) {
        await manager.getRepository(SessionMaterial).save(sessionMaterials);
      }

      // Update treatment session
      if (dto.studentNotes !== undefined) {
        treatmentSession.studentNotes = dto.studentNotes;
      }
      treatmentSession.status = TreatmentSessionStatus.COMPLETED;
      treatmentSession.completedAt = new Date();

      // Prepare and save procedures
      const { updatedProcedures, sessionProcedures } =
        await this.prepareSessionProcedures(
          plannedProcedures,
          dto.performedProcedures,
          treatmentSession,
          manager,
        );

      if (updatedProcedures.length > 0) {
        await manager.getRepository(PlannedProcedures).save(updatedProcedures);
      }
      await manager.getRepository(SessionProcedure).save(sessionProcedures);
      await manager.getRepository(TreatmentSession).save(treatmentSession);

      // Check if all procedures are completed
      await this.updateClinicalCaseStatusIfNeeded(
        manager,
        treatmentSession.clinicalCase.id,
      );

      return {
        message: 'Treatment session completed successfully.',
        treatmentSessionId: treatmentSession.id,
        status: treatmentSession.status,
      };
    });
  }

  // 7. CLINICAL CASE STATUS UPDATE
  private async updateClinicalCaseStatusIfNeeded(
    manager: EntityManager,
    clinicalCaseId: number,
  ): Promise<void> {
    const remainingPlannedProcedures = await manager
      .getRepository(PlannedProcedures)
      .exists({
        where: {
          diagnosisSubmission: {
            clinicalCase: { id: clinicalCaseId },
          },
          status: Not(PlannedProceduresStatus.COMPLETED),
        },
      });

    if (!remainingPlannedProcedures) {
      await manager.getRepository(ClinicalCase).update(clinicalCaseId, {
        status: ClinicalCaseStatus.AWAITING_CASE_REVIEW,
      });
    }
  }
}
