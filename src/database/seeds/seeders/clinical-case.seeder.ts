import { EntityManager } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { Student } from 'src/students/student.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';
import { SeedContext } from '../seed-context';
import { backdate, insert } from '../support/persistence.helper';
import { hasReached } from '../support/stage.helper';
import { CaseBlueprint } from '../data/case-blueprint';
import { COORDINATOR, STUDENTS } from '../data/people.data';
import { SECTIONS, SUBJECTS } from '../data/academic.data';
import { ExaminationSeeder } from './examination.seeder';
import { DiagnosisSeeder, SeededDiagnosis } from './diagnosis.seeder';
import { TreatmentSessionSeeder } from './treatment-session.seeder';
import { MediaSeeder } from './media.seeder';
import { EvaluationSeeder } from './evaluation.seeder';

/**
 * Builds one clinical case up to its target lifecycle stage.
 *
 * This is the composition root of the case-scoped seeders: it owns the *order*
 * of the workflow and nothing else. Each stage seeder is invoked only when the
 * scenario has reached that stage, so "a case at DIAGNOSIS_PENDING_REVIEW has a
 * submission but no sessions" is enforced by one `hasReached` guard rather than
 * by remembering to leave fields out of a fixture.
 */
export class ClinicalCaseSeeder {
  readonly name = 'clinical cases';

  constructor(
    private readonly examinations: ExaminationSeeder,
    private readonly diagnoses: DiagnosisSeeder,
    private readonly sessions: TreatmentSessionSeeder,
    private readonly media: MediaSeeder,
    private readonly evaluations: EvaluationSeeder,
  ) {}

  /**
   * Scenario-level idempotency: the examination request is the root of the
   * whole subtree, so if it exists the case behind it exists too. Checking one
   * row is enough, and it keeps re-runs from producing half-built duplicates.
   */
  async alreadySeeded(
    context: SeedContext,
    manager: EntityManager,
    scenario: CaseBlueprint,
  ): Promise<boolean> {
    const patient = context.patients.require(scenario.patientKey);
    const existing = await manager.findOne(ExaminationRequest, {
      where: {
        patient_id: patient.id,
        chief_complaint: scenario.request.chiefComplaint,
      },
    });
    return existing !== null;
  }

  async seed(
    context: SeedContext,
    manager: EntityManager,
    scenario: CaseBlueprint,
  ): Promise<ClinicalCase> {
    const patient = context.patients.require(scenario.patientKey);
    const subject = context.subjects.require(scenario.subjectKey);
    const coordinator = context.coordinators.require(COORDINATOR.key);

    // ── Intake ────────────────────────────────────────────────────────────
    const request = await this.examinations.seedRequest(context, manager, {
      scenarioKey: scenario.key,
      patient,
      blueprint: scenario.request,
      status: ExaminationRequestStatus.CONVERTED_TO_CASE,
    });

    const visit = await this.examinations.seedVisit(context, manager, {
      request,
      coordinator,
      blueprint: scenario.examinationVisit,
    });

    const initialExamination = await this.examinations.seedInitialExamination(
      context,
      manager,
      {
        request,
        appointment: visit,
        coordinator,
        subject,
        blueprint: scenario.initialExamination,
        visit: scenario.examinationVisit,
      },
    );

    // ── The case itself ───────────────────────────────────────────────────
    const openedAt = context.clock.at(
      context.clock.clinicDay(scenario.examinationVisit.dayOffset),
      scenario.examinationVisit.start,
    );

    const clinicalCase = await insert(manager, ClinicalCase, {
      patient,
      request,
      initialExamination,
      subject,
      status: ClinicalCaseStatus.OPEN,
    });
    await backdate(manager, ClinicalCase, clinicalCase.id, {
      createdAt: openedAt,
    });
    context.clinicalCases.set(scenario.key, clinicalCase);

    if (!hasReached(scenario.targetStage, ClinicalCaseStatus.ASSIGNED)) {
      context.logger.created('clinical case', `${scenario.title} [open]`);
      return clinicalCase;
    }

    // ── Assignment ────────────────────────────────────────────────────────
    const { student, supervisor } = this.resolveCareTeam(context, scenario);

    clinicalCase.assignedStudent = student;
    clinicalCase.assignedSupervisor = supervisor;
    clinicalCase.status = ClinicalCaseStatus.ASSIGNED;
    await manager.save(clinicalCase);

    if (!scenario.assignment) {
      throw new Error(
        `Scenario "${scenario.key}" targets ${scenario.targetStage} but declares no ` +
          `assignment appointment. A case leaves the open pool only when a student books one.`,
      );
    }

    await this.sessions.createAppointment(context, manager, {
      blueprint: scenario.assignment,
      clinicalCase,
      student,
      supervisor,
    });

    // ── Diagnosis ─────────────────────────────────────────────────────────
    if (
      !hasReached(
        scenario.targetStage,
        ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW,
      )
    ) {
      context.logger.created('clinical case', `${scenario.title} [assigned]`);
      return clinicalCase;
    }

    if (!scenario.diagnosis) {
      throw new Error(
        `Scenario "${scenario.key}" targets ${scenario.targetStage} but declares no diagnosis.`,
      );
    }

    const diagnosis = await this.diagnoses.seed(context, manager, {
      scenario,
      blueprint: scenario.diagnosis,
      clinicalCase,
      student,
      supervisor,
    });

    await this.applyStatus(
      manager,
      clinicalCase,
      ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW,
    );

    // ── Treatment ─────────────────────────────────────────────────────────
    if (
      !hasReached(
        scenario.targetStage,
        ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
      )
    ) {
      context.logger.created(
        'clinical case',
        `${scenario.title} [diagnosis pending review]`,
      );
      return clinicalCase;
    }

    if (!scenario.diagnosis.review) {
      throw new Error(
        `Scenario "${scenario.key}" reaches treatment without an approved diagnosis. ` +
          `Add a supervisor review to the diagnosis blueprint.`,
      );
    }

    await this.applyStatus(
      manager,
      clinicalCase,
      ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
    );

    await this.sessions.seed(context, manager, {
      scenario,
      clinicalCase,
      student,
      supervisor,
      diagnosis,
    });

    await this.media.seed(context, manager, {
      scenario,
      clinicalCase,
      uploadedBy: student,
      uploadedAt: this.lastClinicalActivity(context, scenario),
    });

    // ── Review and closure ────────────────────────────────────────────────
    if (
      !hasReached(scenario.targetStage, ClinicalCaseStatus.AWAITING_CASE_REVIEW)
    ) {
      context.logger.created(
        'clinical case',
        `${scenario.title} [treatment in progress]`,
      );
      return clinicalCase;
    }

    this.assertTreatmentFinished(scenario, diagnosis);
    await this.applyStatus(
      manager,
      clinicalCase,
      ClinicalCaseStatus.AWAITING_CASE_REVIEW,
    );

    if (!hasReached(scenario.targetStage, ClinicalCaseStatus.COMPLETED)) {
      context.logger.created(
        'clinical case',
        `${scenario.title} [awaiting case review]`,
      );
      return clinicalCase;
    }

    await this.evaluations.seed(context, manager, {
      scenario,
      clinicalCase,
      student,
      supervisor,
    });
    clinicalCase.status = ClinicalCaseStatus.COMPLETED;

    context.logger.created('clinical case', `${scenario.title} [completed]`);
    return clinicalCase;
  }

  /**
   * The supervisor is derived from the subject's clinic section, never picked
   * arbitrarily, and the assigned student must rotate through that same
   * section — which is exactly the constraint the assignment endpoint applies.
   */
  private resolveCareTeam(
    context: SeedContext,
    scenario: CaseBlueprint,
  ): { student: Student; supervisor: Supervisor } {
    if (!scenario.studentKey) {
      throw new Error(
        `Scenario "${scenario.key}" targets ${scenario.targetStage} but names no student.`,
      );
    }

    const subjectBlueprint = SUBJECTS.find(
      (subject) => subject.key === scenario.subjectKey,
    );
    const studentBlueprint = STUDENTS.find(
      (student) => student.key === scenario.studentKey,
    );

    if (!subjectBlueprint || !studentBlueprint) {
      throw new Error(
        `Scenario "${scenario.key}" references an unknown subject or student.`,
      );
    }

    if (studentBlueprint.sectionKey !== subjectBlueprint.sectionKey) {
      throw new Error(
        `Scenario "${scenario.key}": ${studentBlueprint.fullName} rotates through ` +
          `${studentBlueprint.sectionKey} but ${subjectBlueprint.name} is taught in ` +
          `${subjectBlueprint.sectionKey}. A student cannot take a case outside their section.`,
      );
    }

    const section = SECTIONS.find(
      (candidate) => candidate.key === subjectBlueprint.sectionKey,
    );
    if (!section) {
      throw new Error(
        `Unknown clinic section "${subjectBlueprint.sectionKey}" for ${subjectBlueprint.name}.`,
      );
    }

    return {
      student: context.students.require(scenario.studentKey),
      supervisor: context.supervisors.require(section.supervisorKey),
    };
  }

  private async applyStatus(
    manager: EntityManager,
    clinicalCase: ClinicalCase,
    status: ClinicalCaseStatus,
  ): Promise<void> {
    clinicalCase.status = status;
    await manager.save(clinicalCase);
  }

  /** Media is attributed to the last day something actually happened. */
  private lastClinicalActivity(
    context: SeedContext,
    scenario: CaseBlueprint,
  ): Date {
    const completed = (scenario.sessions ?? []).filter(
      (session) => session.status === TreatmentSessionStatus.COMPLETED,
    );
    const offset = completed.length
      ? Math.max(...completed.map((session) => session.appointment.dayOffset))
      : (scenario.diagnosis?.submittedDayOffset ?? 0);

    return context.clock.at(context.clock.clinicDay(offset), '13:00');
  }

  private assertTreatmentFinished(
    scenario: CaseBlueprint,
    diagnosis: SeededDiagnosis,
  ): void {
    const unfinished = [...diagnosis.plannedProcedures.entries()].filter(
      ([, procedure]) => procedure.status !== PlannedProceduresStatus.COMPLETED,
    );

    if (unfinished.length > 0) {
      throw new Error(
        `Scenario "${scenario.key}" is at or past AWAITING_CASE_REVIEW, but ` +
          `[${unfinished.map(([key]) => key).join(', ')}] are not completed. ` +
          `The case only moves to review once every planned procedure is done.`,
      );
    }
  }
}
