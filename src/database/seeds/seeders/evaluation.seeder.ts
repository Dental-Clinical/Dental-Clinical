import { EntityManager } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseEvaluation } from 'src/clinical-case-evaluation/clinical-case-evaluation.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { Student } from 'src/students/student.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { SeedContext } from '../seed-context';
import { backdate, insert } from '../support/persistence.helper';
import { CaseBlueprint } from '../data/case-blueprint';

/**
 * The supervisor's final grade.
 *
 * `ClinicalCaseEvaluationService` closes the case in the same transaction that
 * writes the evaluation, so the seeder stamps `closed_at` here too. A COMPLETED
 * case without an evaluation — or with a null `closed_at` — is not a state the
 * API produces.
 */
export class EvaluationSeeder {
  readonly name = 'evaluations';

  async seed(
    context: SeedContext,
    manager: EntityManager,
    params: {
      scenario: CaseBlueprint;
      clinicalCase: ClinicalCase;
      student: Student;
      supervisor: Supervisor;
    },
  ): Promise<void> {
    const blueprint = params.scenario.evaluation;
    if (!blueprint) return;

    const evaluatedAt = context.clock.day(blueprint.dayOffset);

    const evaluation = await insert(manager, ClinicalCaseEvaluation, {
      clinicalCase: params.clinicalCase,
      student: params.student,
      supervisor: params.supervisor,
      grade: blueprint.grade,
      comment: blueprint.comment,
    });

    await backdate(manager, ClinicalCaseEvaluation, evaluation.id, {
      createdAt: evaluatedAt,
    });

    await backdate(manager, ClinicalCase, params.clinicalCase.id, {
      status: ClinicalCaseStatus.COMPLETED,
      closedAt: evaluatedAt,
    });

    context.logger.created(
      'case evaluation',
      `${params.scenario.key} — grade ${blueprint.grade}`,
    );
  }
}
