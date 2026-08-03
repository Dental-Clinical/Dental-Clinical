import { EntityManager } from 'typeorm';
import { SeedContext } from './seed-context';

/**
 * A seeder owns exactly one slice of the dataset and receives the transaction
 * it must write through. It never opens its own transaction and never touches
 * the DataSource — that decision belongs to the runner, which is what lets the
 * same seeder run inside the baseline transaction or a per-scenario one.
 */
export interface Seeder {
  /** Shown in the run report; also used to identify failures. */
  readonly name: string;

  run(context: SeedContext, manager: EntityManager): Promise<void>;
}
