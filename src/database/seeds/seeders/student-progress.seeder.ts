import { EntityManager } from 'typeorm';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { StudentProgress } from 'src/student-progress/student-progress.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { CARRY_OVER_CREDIT } from '../data/progress.data';

interface CreditRow {
  studentId: number;
  subjectProcedureId: number;
  awarded: number;
}

/**
 * Academic credit per student and subject procedure.
 *
 * Runs last, and derives most of its numbers from what the case seeders
 * actually wrote: it repeats the aggregation `StudentProgressService`
 * .awardProcedureCredit performs — completed planned procedures on cases that
 * reached COMPLETED — instead of hardcoding totals that would silently drift
 * away from the cases the moment a scenario changes.
 *
 * On top of that it adds the curated carry-over credit from earlier in the term
 * (see `progress.data.ts`), because two evaluated cases alone leave every
 * requirement bar near zero.
 *
 * Counts are written as absolute values rather than increments, which is what
 * makes re-running the seed leave the numbers unchanged instead of doubling
 * them — the one place where the runtime's increment semantics are deliberately
 * not copied.
 */
export class StudentProgressSeeder implements Seeder {
  readonly name = 'student progress';

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const totals = new Map<string, CreditRow>();

    for (const row of await this.creditFromCompletedCases(manager)) {
      this.add(totals, row);
    }
    for (const row of this.carryOverCredit(context)) {
      this.add(totals, row);
    }

    for (const row of totals.values()) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(StudentProgress)
        .values({
          student: { id: row.studentId },
          subjectProcedure: { id: row.subjectProcedureId },
          completedCount: row.awarded,
        })
        // Leans on the (student, subject_procedure) unique constraint the same
        // way the runtime does, but overwrites rather than increments.
        .orUpdate(['completed_count'], ['student_id', 'subject_procedure_id'])
        .execute();
    }

    context.logger.step(
      `${totals.size} progress rows across ${new Set([...totals.values()].map((row) => row.studentId)).size} students`,
    );
  }

  /** Mirrors the aggregation the evaluation flow performs at runtime. */
  private async creditFromCompletedCases(
    manager: EntityManager,
  ): Promise<CreditRow[]> {
    const raw = await manager
      .getRepository(PlannedProcedures)
      .createQueryBuilder('pp')
      .select('cc.assigned_student_id', 'studentId')
      .addSelect('pp.subject_procedure_id', 'subjectProcedureId')
      .addSelect('COUNT(*)', 'awarded')
      .innerJoin('pp.diagnosisSubmission', 'ds')
      .innerJoin('ds.clinicalCase', 'cc')
      .where('pp.status = :procedureStatus', {
        procedureStatus: PlannedProceduresStatus.COMPLETED,
      })
      .andWhere('cc.status = :caseStatus', {
        caseStatus: ClinicalCaseStatus.COMPLETED,
      })
      .andWhere('cc.assigned_student_id IS NOT NULL')
      .groupBy('cc.assigned_student_id')
      .addGroupBy('pp.subject_procedure_id')
      .getRawMany<Record<string, string>>();

    return raw.map((row) => ({
      studentId: Number(row.studentId),
      subjectProcedureId: Number(row.subjectProcedureId),
      awarded: Number(row.awarded),
    }));
  }

  private carryOverCredit(context: SeedContext): CreditRow[] {
    return CARRY_OVER_CREDIT.map((credit) => ({
      studentId: context.students.require(credit.studentKey).id,
      subjectProcedureId: context.requireProcedure(
        credit.subjectKey,
        credit.procedure,
      ).id,
      awarded: credit.count,
    }));
  }

  private add(totals: Map<string, CreditRow>, row: CreditRow): void {
    const key = `${row.studentId}:${row.subjectProcedureId}`;
    const existing = totals.get(key);
    if (existing) {
      existing.awarded += row.awarded;
      return;
    }
    totals.set(key, { ...row });
  }
}
