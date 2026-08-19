import { EntityManager } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { DiagnosisImages } from 'src/diagnosis-images/diagnosis-images.entity';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { DiagnosisSubmissionStatus } from 'src/diagnosis-submission/enums/diagnosis-submission-status.enum';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { Student } from 'src/students/student.entity';
import { SupervisorReview } from 'src/supervisor-reviews/supervisor-reviews.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { SeedContext } from '../seed-context';
import { backdate, insert } from '../support/persistence.helper';
import { assertValidTeeth } from '../support/teeth.helper';
import { CaseBlueprint, DiagnosisBlueprint } from '../data/case-blueprint';

/** Stable handle for a planned procedure within one case. */
export function procedureRef(procedure: string, tooth: number): string {
  return `${procedure}#${tooth}`;
}

export interface SeededDiagnosis {
  submission: DiagnosisSubmission;
  /** Keyed by `procedureRef`, so sessions can attach to the right planned row. */
  plannedProcedures: Map<string, PlannedProcedures>;
}

/**
 * The student's diagnosis: supporting images, the planned procedure list, and
 * the supervisor's review once the plan is approved.
 *
 * The submission status is derived from the presence of a review rather than
 * declared separately — an approved plan with a `pending_review` submission is
 * a state the API can never produce, and the seed must not invent it.
 */
export class DiagnosisSeeder {
  readonly name = 'diagnoses';

  async seed(
    context: SeedContext,
    manager: EntityManager,
    params: {
      scenario: CaseBlueprint;
      blueprint: DiagnosisBlueprint;
      clinicalCase: ClinicalCase;
      student: Student;
      supervisor: Supervisor;
    },
  ): Promise<SeededDiagnosis> {
    const { blueprint, clinicalCase, scenario, student, supervisor } = params;
    const submittedAt = context.clock.day(blueprint.submittedDayOffset);

    const submission = await insert(manager, DiagnosisSubmission, {
      clinicalCase,
      student,
      supervisor,
      status: blueprint.review
        ? DiagnosisSubmissionStatus.APPROVED
        : DiagnosisSubmissionStatus.PENDING_REVIEW,
    });

    await backdate(manager, DiagnosisSubmission, submission.id, {
      submittedAt,
      createdAt: submittedAt,
    });

    for (const image of blueprint.images) {
      const asset = context.media.build('diagnosis-image', scenario.key, image);
      const row = await insert(manager, DiagnosisImages, {
        diagnosisSubmission: submission,
        publicId: asset.publicId,
        fileUrl: asset.fileUrl,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      await backdate(manager, DiagnosisImages, row.id, {
        uploadedAt: submittedAt,
        createdAt: submittedAt,
      });
    }

    assertValidTeeth(
      blueprint.procedures.map((procedure) => procedure.tooth),
      `diagnosis of "${scenario.key}"`,
    );

    const plannedProcedures = new Map<string, PlannedProcedures>();
    for (const planned of blueprint.procedures) {
      const subjectProcedure = context.requireProcedure(
        scenario.subjectKey,
        planned.procedure,
      );

      const row = await insert(manager, PlannedProcedures, {
        clinicalCase,
        subjectProcedure,
        diagnosisSubmission: submission,
        toothNumber: planned.tooth,
        status: planned.status,
      });
      await backdate(manager, PlannedProcedures, row.id, {
        createdAt: submittedAt,
      });

      plannedProcedures.set(
        procedureRef(planned.procedure, planned.tooth),
        row,
      );
    }

    if (blueprint.review) {
      const reviewedAt = context.clock.day(blueprint.review.dayOffset);
      const review = await insert(manager, SupervisorReview, {
        diagnosisSubmission: submission,
        supervisor,
        notes: blueprint.review.notes,
      });
      await backdate(manager, SupervisorReview, review.id, {
        reviewedAt,
        createdAt: reviewedAt,
      });
      context.logger.created('supervisor review', scenario.key);
    }

    context.logger.created(
      'diagnosis submission',
      `${blueprint.procedures.length} planned procedures, ${blueprint.images.length} images`,
    );

    return { submission, plannedProcedures };
  }
}
