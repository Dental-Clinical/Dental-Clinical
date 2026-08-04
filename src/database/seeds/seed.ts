import 'reflect-metadata';
import { connectionSource } from '../database.config';
import { loadSeedConfig } from './seed.config';
import { SeedContext } from './seed-context';
import { SeedLogger } from './support/seed-logger';
import { resetSeededTables } from './support/reset.helper';
import { DemoSeeder } from './seeders/demo.seeder';

/**
 * Standalone entry point — deliberately *not* a Nest application context.
 *
 * Booting the Nest container would pull in Redis, Cloudinary, the JWT guards and
 * every module's providers just to write rows, and would then force the seed
 * through the services, which enforce the workflow rather than let it be
 * constructed. Reaching TREATMENT_IN_PROGRESS through the API means logging in
 * as four different users across a dozen requests; the seeder instead writes the
 * rows directly and reproduces the invariants those services enforce (see the
 * assertions in the case and session seeders).
 */
async function main(): Promise<void> {
  const config = loadSeedConfig();
  const logger = new SeedLogger(config.verbose);
  const dataSource = await connectionSource.initialize();

  try {
    logger.section('Dental Clinical — demo seed');
    logger.step(`database: ${dataSource.options.database ?? 'from DB_URL'}`);
    logger.step(`timeline anchor: ${config.anchor.toISOString().slice(0, 10)}`);

    if (config.reset) {
      await resetSeededTables(dataSource, config, logger);
    }

    const context = new SeedContext(config, logger);
    await new DemoSeeder(dataSource, context).run();

    logger.section('Done');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('\n✖ Seeding failed.\n', error);
  process.exitCode = 1;
});
