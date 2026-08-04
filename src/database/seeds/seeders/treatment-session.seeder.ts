import { EntityManager } from 'typeorm';
import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { SessionProcedure } from 'src/sesssion-procedures/session-procedures.entity';
import { Student } from 'src/students/student.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { TreatmentSession } from 'src/treatment-sessions/treatment-sessions.entity';
import { TreatmentSessionStatus } from 'src/treatment-sessions/enums/treatment-session-status.enum';
import { SeedContext } from '../seed-context';
import { backdate, insert } from '../support/persistence.helper';
import { addMinutes } from '../support/clock.helper';
import {
  AppointmentBlueprint,
  CaseBlueprint,
  SessionBlueprint,
} from '../data/case-blueprint';
import { procedureRef, SeededDiagnosis } from './diagnosis.seeder';

/**
 * Treatment sessions and the appointments they hang off.
 *
 * Two invariants from `TreatmentSessionsService` are reproduced here, because a
 * dataset that violates them would let the frontend render states the API can
 * never return:
 *
 *   1. Procedures and materials are recorded *at completion*. An ACTIVE,
 *      UPCOMING or PATIENT_ABSENT session therefore carries neither, and the
 *      blueprint is rejected if it tries to.
 *   2. A COMPLETED session must reference at least one planned procedure, which
 *      is what the completion endpoint enforces before it will close a session.
 */
export class TreatmentSessionSeeder {
  readonly name = 'treatment sessions';

  async seed(
    context: SeedContext,
    manager: EntityManager,
    params: {
      scenario: CaseBlueprint;
      clinicalCase: ClinicalCase;
      student: Student;
      supervisor: Supervisor;
      diagnosis: SeededDiagnosis;
    },
  ): Promise<TreatmentSession[]> {
    const sessions: TreatmentSession[] = [];

    for (const blueprint of params.scenario.sessions ?? []) {
      this.assertConsistent(params.scenario, blueprint);

      const appointment = await this.createAppointment(context, manager, {
        blueprint: blueprint.appointment,
        clinicalCase: params.clinicalCase,
        student: params.student,
        supervisor: params.supervisor,
      });

      const startedAt = context.clock.at(
        context.clock.clinicDay(blueprint.appointment.dayOffset),
        blueprint.appointment.start,
      );
      const completedAt =
        blueprint.status === TreatmentSessionStatus.COMPLETED
          ? new Date(
              startedAt.getTime() +
                blueprint.appointment.durationMinutes * 60_000,
            )
          : undefined;

      const session = await insert(manager, TreatmentSession, {
        clinicalCase: params.clinicalCase,
        clinicalAppointment: appointment,
        title: blueprint.title,
        studentNotes: blueprint.studentNotes,
        supervisorNotes: blueprint.supervisorNotes,
        status: blueprint.status,
        completedAt,
      });

      await backdate(manager, TreatmentSession, session.id, {
        startedAt,
        createdAt: startedAt,
      });

      await this.attachProcedures(context, manager, {
        session,
        blueprint,
        diagnosis: params.diagnosis,
        scenario: params.scenario,
        recordedAt: completedAt ?? startedAt,
      });
      await this.attachMaterials(context, manager, { session, blueprint });

      context.logger.created(
        'treatment session',
        `${blueprint.title} — ${blueprint.status}`,
      );
      sessions.push(session);
    }

    return sessions;
  }

  /** The appointment that moved the case from OPEN to ASSIGNED. */
  async createAppointment(
    context: SeedContext,
    manager: EntityManager,
    params: {
      blueprint: AppointmentBlueprint;
      clinicalCase: ClinicalCase;
      student: Student;
      supervisor: Supervisor;
    },
  ): Promise<ClinicalAppointment> {
    const { blueprint, clinicalCase } = params;
    const date = context.clock.clinicDay(blueprint.dayOffset);

    return insert(manager, ClinicalAppointment, {
      clinicalCase,
      student: params.student,
      supervisor: params.supervisor,
      patient: clinicalCase.patient,
      appointmentDate: context.clock.dateOnly(date),
      appointmentStart: blueprint.start,
      appointmentEnd: addMinutes(blueprint.start, blueprint.durationMinutes),
      status: blueprint.status,
    });
  }

  private async attachProcedures(
    context: SeedContext,
    manager: EntityManager,
    params: {
      session: TreatmentSession;
      blueprint: SessionBlueprint;
      diagnosis: SeededDiagnosis;
      scenario: CaseBlueprint;
      recordedAt: Date;
    },
  ): Promise<void> {
    for (const ref of params.blueprint.procedures) {
      const key = procedureRef(ref.procedure, ref.tooth);
      const plannedProcedure = params.diagnosis.plannedProcedures.get(key);

      if (!plannedProcedure) {
        throw new Error(
          `Scenario "${params.scenario.key}": session "${params.blueprint.title}" ` +
            `references "${key}", which is not in the case's planned procedures. ` +
            `Available: [${[...params.diagnosis.plannedProcedures.keys()].join(', ')}]`,
        );
      }

      const row = await insert(manager, SessionProcedure, {
        treatmentSession: params.session,
        plannedProcedure,
      });
      await backdate(manager, SessionProcedure, row.id, {
        createdAt: params.recordedAt,
      });
    }
  }

  private async attachMaterials(
    context: SeedContext,
    manager: EntityManager,
    params: { session: TreatmentSession; blueprint: SessionBlueprint },
  ): Promise<void> {
    for (const materialKey of params.blueprint.materials) {
      await insert(manager, SessionMaterial, {
        treatmentSession: params.session,
        material: context.materials.require(materialKey),
      });
    }
  }

  private assertConsistent(
    scenario: CaseBlueprint,
    blueprint: SessionBlueprint,
  ): void {
    const isCompleted = blueprint.status === TreatmentSessionStatus.COMPLETED;
    const hasRecords =
      blueprint.procedures.length > 0 || blueprint.materials.length > 0;

    if (isCompleted && blueprint.procedures.length === 0) {
      throw new Error(
        `Scenario "${scenario.key}": session "${blueprint.title}" is COMPLETED ` +
          `but records no procedure. The completion endpoint rejects this.`,
      );
    }

    if (!isCompleted && hasRecords) {
      throw new Error(
        `Scenario "${scenario.key}": session "${blueprint.title}" is ${blueprint.status} ` +
          `but already records procedures or materials. Those are only written at completion.`,
      );
    }
  }
}
