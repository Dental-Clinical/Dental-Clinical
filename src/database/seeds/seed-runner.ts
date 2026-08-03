import { DataSource, EntityManager } from 'typeorm';
import { SeedContext } from './seed-context';
import { Seeder } from './seeder.interface';

export class SeedError extends Error {
  constructor(
    readonly stage: string,
    readonly cause: unknown,
  ) {
    super(
      `Seed stage "${stage}" failed and was rolled back: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'SeedError';
  }
}

/**
 * Owns every transaction boundary in the seed.
 *
 * Seeders receive a manager and never open transactions themselves, so the
 * boundary is a decision made once, here, and can be changed without touching a
 * single seeder.
 */
export class SeedRunner {
  constructor(
    private readonly dataSource: DataSource,
    private readonly context: SeedContext,
  ) {}

  /** Runs a group of seeders sequentially inside one transaction. */
  async pipeline(label: string, seeders: Seeder[]): Promise<void> {
    await this.transaction(label, async (manager) => {
      for (const seeder of seeders) {
        await this.context.logger.nested(seeder.name, () =>
          seeder.run(this.context, manager),
        );
      }
    });
  }

  /** Runs arbitrary work inside its own transaction. */
  async transaction<T>(
    label: string,
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    this.context.logger.section(label);
    const startedAt = Date.now();

    try {
      const result = await this.dataSource.transaction(work);
      this.context.logger.step(`committed in ${Date.now() - startedAt} ms`);
      return result;
    } catch (error) {
      throw new SeedError(label, error);
    }
  }
}
