import { EntityManager } from 'typeorm';
import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';
import { Material } from 'src/materials/materials.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { SECTIONS, SUBJECTS } from '../data/academic.data';
import { MATERIALS } from '../data/materials.data';

/**
 * Clinic sections, the materials catalogue, subjects and their procedure
 * requirements — the reference data every clinical case points at.
 *
 * Kept in one seeder because the four tables form a single unit of meaning (a
 * subject is meaningless without its procedures and its section) and splitting
 * them would only add ordering constraints without adding clarity.
 */
export class ClinicStructureSeeder implements Seeder {
  readonly name = 'clinic structure';

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    await this.seedSections(context, manager);
    await this.seedMaterials(context, manager);
    await this.seedSubjects(context, manager);
  }

  private async seedSections(
    context: SeedContext,
    manager: EntityManager,
  ): Promise<void> {
    for (const blueprint of SECTIONS) {
      const supervisor = context.supervisors.require(blueprint.supervisorKey);
      const { entity, created } = await upsertBy(
        manager,
        ClinicSections,
        { name: blueprint.name },
        () => ({ name: blueprint.name, supervisor, is_active: true }),
      );
      if (created) context.logger.created('clinic section', blueprint.name);
      context.sections.set(blueprint.key, entity);
    }
  }

  private async seedMaterials(
    context: SeedContext,
    manager: EntityManager,
  ): Promise<void> {
    for (const blueprint of MATERIALS) {
      const { entity, created } = await upsertBy(
        manager,
        Material,
        { name: blueprint.name },
        () => ({ name: blueprint.name, description: blueprint.description }),
      );
      if (created) context.logger.created('material', blueprint.name);
      context.materials.set(blueprint.key, entity);
    }
  }

  private async seedSubjects(
    context: SeedContext,
    manager: EntityManager,
  ): Promise<void> {
    for (const blueprint of SUBJECTS) {
      const studyYear = context.studyYears.require(blueprint.studyYearKey);
      const section = context.sections.require(blueprint.sectionKey);
      const materials = blueprint.materialKeys.map((key) =>
        context.materials.require(key),
      );

      const { entity: subject, created } = await upsertBy(
        manager,
        Subject,
        { name: blueprint.name, studyYear: { id: studyYear.id } },
        () => ({
          name: blueprint.name,
          description: blueprint.description,
          studyYear,
          section,
          is_active: true,
        }),
      );

      // The join table is owned by Subject; re-assigning is idempotent because
      // TypeORM diffs the relation rather than blindly inserting.
      subject.materials = materials;
      await manager.save(subject);

      if (created) context.logger.created('subject', blueprint.name);
      context.subjects.set(blueprint.key, subject);

      for (const procedure of blueprint.procedures) {
        const { entity, created: madeProcedure } = await upsertBy(
          manager,
          SubjectProcedures,
          { name: procedure.name, subject: { id: subject.id } },
          () => ({
            subject,
            name: procedure.name,
            description: procedure.description,
            required_count: procedure.requiredCount,
            is_active: true,
          }),
        );
        if (madeProcedure) {
          context.logger.created('subject procedure', procedure.name);
        }
        context.subjectProcedures.set(
          `${blueprint.key}:${procedure.name}`,
          entity,
        );
      }
    }
  }
}
