import { DataSource } from 'typeorm';
import { SeedContext } from '../seed-context';
import { SeedRunner } from '../seed-runner';
import { PasswordVault } from '../support/password.helper';
import { CASE_SCENARIOS } from '../data/scenarios.data';
import { UserSeeder } from './user.seeder';
import { AcademicSeeder } from './academic.seeder';
import { ClinicStructureSeeder } from './clinic-structure.seeder';
import { ScheduleSeeder } from './schedule.seeder';
import { EnrollmentSeeder } from './enrollment.seeder';
import { PatientSeeder } from './patient.seeder';
import { ExaminationSeeder } from './examination.seeder';
import { DiagnosisSeeder } from './diagnosis.seeder';
import { TreatmentSessionSeeder } from './treatment-session.seeder';
import { MediaSeeder } from './media.seeder';
import { EvaluationSeeder } from './evaluation.seeder';
import { ClinicalCaseSeeder } from './clinical-case.seeder';
import { PendingRequestSeeder } from './pending-request.seeder';
import { StudentProgressSeeder } from './student-progress.seeder';

/**
 * The entry point that assembles the whole demo dataset.
 *
 * It owns two things and nothing else: the wiring of the seeders, and the three
 * transaction boundaries.
 *
 *   1. **Baseline** — one transaction. Users, calendar, clinic structure,
 *      schedules and enrollments are mutually dependent and worthless
 *      individually; either the whole foundation exists or none of it does.
 *
 *   2. **One transaction per clinical scenario.** A case spans a dozen tables,
 *      and half a case is worse than no case: the frontend would render a
 *      treatment timeline with no diagnosis behind it. Per-scenario boundaries
 *      make "the case is complete or absent" a database guarantee, keep each
 *      transaction short enough for a serverless Postgres connection, and let a
 *      re-run repair only the scenarios that are missing.
 *
 *   3. **Derived data last** — pending requests and student progress, which
 *      read back what the scenarios committed.
 */
export class DemoSeeder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly context: SeedContext,
  ) {}

  async run(): Promise<void> {
    const runner = new SeedRunner(this.dataSource, this.context);
    const passwords = new PasswordVault(this.context.config.password);
    const examinations = new ExaminationSeeder();

    const caseSeeder = new ClinicalCaseSeeder(
      examinations,
      new DiagnosisSeeder(),
      new TreatmentSessionSeeder(),
      new MediaSeeder(),
      new EvaluationSeeder(),
    );

    await runner.pipeline('Baseline', [
      new UserSeeder(passwords),
      new AcademicSeeder(),
      new ClinicStructureSeeder(),
      new ScheduleSeeder(),
      new EnrollmentSeeder(),
      new PatientSeeder(passwords),
    ]);

    for (const scenario of CASE_SCENARIOS) {
      await runner.transaction(
        `Scenario — ${scenario.title}`,
        async (manager) => {
          if (await caseSeeder.alreadySeeded(this.context, manager, scenario)) {
            this.context.logger.skipped('scenario already present');
            return;
          }
          await caseSeeder.seed(this.context, manager, scenario);
        },
      );
    }

    await runner.pipeline('Derived data', [
      new PendingRequestSeeder(examinations),
      new StudentProgressSeeder(),
    ]);

    this.context.logger.summary();
    this.printCredentials();
  }

  private printCredentials(): void {
    const { logger, config } = this.context;
    logger.section('Sign in');
    logger.step(`password for every seeded account: ${config.password}`);
    for (const [key, user] of this.context.users.entries()) {
      logger.step(`${key.padEnd(24)} ${user.email}`);
    }
  }
}
