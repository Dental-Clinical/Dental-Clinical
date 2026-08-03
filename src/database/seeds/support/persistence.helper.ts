import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * `NoInfer` pins the entity type to the `target` argument. Without it TypeScript
 * also infers from the object literals, and every call resolves to the shape of
 * the literal instead of the entity — which silently disables the type checking
 * these helpers exist to provide.
 */
type Draft<T> = DeepPartial<NoInfer<T>>;
type Criteria<T> = FindOptionsWhere<NoInfer<T>>;

/**
 * Idempotent insert keyed on a natural business key.
 *
 * Used for the shared baseline (users, academic structure, catalogues) where a
 * natural key exists and re-running must not duplicate rows. Case-scoped data
 * uses scenario-level idempotency instead — see `ClinicalCaseSeeder`.
 */
export async function upsertBy<T extends ObjectLiteral>(
  manager: EntityManager,
  target: EntityTarget<T>,
  where: Criteria<T>,
  build: () => Draft<T>,
): Promise<{ entity: T; created: boolean }> {
  const existing = await manager.findOne(target, {
    where: where,
  });
  if (existing) {
    return { entity: existing, created: false };
  }

  const entity = manager.create(target, build() as DeepPartial<T>);
  return { entity: await manager.save(entity), created: true };
}

/** `upsertBy` without the flag, for call sites that do not report creation. */
export async function ensure<T extends ObjectLiteral>(
  manager: EntityManager,
  target: EntityTarget<T>,
  where: Criteria<T>,
  build: () => Draft<T>,
): Promise<T> {
  return (await upsertBy(manager, target, where, build)).entity;
}

/** Straight insert — for rows with no natural key, inside a scenario transaction. */
export async function insert<T extends ObjectLiteral>(
  manager: EntityManager,
  target: EntityTarget<T>,
  values: Draft<T>,
): Promise<T> {
  return manager.save(manager.create(target, values as DeepPartial<T>));
}

/**
 * Rewrites `@CreateDateColumn` / audit timestamps after the insert.
 *
 * TypeORM stamps those columns itself on insert, so a seeded "session completed
 * three weeks ago" would otherwise be created_at = now and every timeline view
 * would collapse into a single day. An UPDATE is the only way to place history.
 *
 * Keys are entity property names, not column names — the query builder maps them.
 */
export async function backdate<T extends ObjectLiteral>(
  manager: EntityManager,
  target: EntityTarget<T>,
  id: number,
  values: QueryDeepPartialEntity<NoInfer<T>>,
): Promise<void> {
  await manager
    .createQueryBuilder()
    .update(target)
    .set(values)
    .where('id = :id', { id })
    .execute();
}
