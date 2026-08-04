import { EntityManager } from 'typeorm';
import { Clinic } from 'src/clinic/clinic.entity';
import { Section } from 'src/section/section.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { Material } from 'src/materials/materials.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { SECTIONS, SUBJECTS } from '../data/academic.data';
import { MATERIALS } from '../data/materials.data';

/** The faculty runs one clinic; sections and subjects all belong to it. */
const CLINIC_NAME = 'Dental Clinic';

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
    await this.seedClinic(context, manager);
    await this.seedSections(context, manager);
    await this.seedMaterials(context, manager);
    await this.seedSubjects(context, manager);
    await this.seedSectionSubjects(context, manager);
  }

  /**
   * The faculty runs a single clinic, so it is implied rather than spelled out
   * in the blueprints. Sections and subjects both hang off it.
   */
  private async seedClinic(
    context: SeedContext,
    manager: EntityManager,
  ): Promise<void> {
    const academicYear = context.academicYears.require('current');

    const { entity, created } = await upsertBy(
      manager,
      Clinic,
      { name: CLINIC_NAME },
      () => ({ name: CLINIC_NAME, academicYear }),
    );
    if (created) context.logger.created('clinic', CLINIC_NAME);
    context.clinics.set('current', entity);
  }

  private async seedSections(
    context: SeedContext,
    manager: EntityManager,
  ): Promise<void> {
    const clinic = context.clinics.require('current');

    for (const blueprint of SECTIONS) {
      const { entity, created } = await upsertBy(
        manager,
        Section,
        { name: blueprint.name },
        () => ({ name: blueprint.name, clinic }),
      );
      if (created) context.logger.created('section', blueprint.name);
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
    const clinic = context.clinics.require('current');

    for (const blueprint of SUBJECTS) {
      const studyYear = context.studyYears.require(blueprint.studyYearKey);
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
          clinic,
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

  /**
   * Which subject is taught in which section, and by whom. The supervisor used
   * to live on the section itself; it now belongs to the (section, subject,
   * year) triple, so a section can have a different supervisor per subject.
   */
  private async seedSectionSubjects(
    context: SeedContext,
    manager: EntityManager,
  ): Promise<void> {
    const academicYear = context.academicYears.require('current');

    for (const blueprint of SUBJECTS) {
      const subject = context.subjects.require(blueprint.key);
      const section = context.sections.require(blueprint.sectionKey);

      const sectionBlueprint = SECTIONS.find(
        (candidate) => candidate.key === blueprint.sectionKey,
      );
      if (!sectionBlueprint) {
        throw new Error(
          `Subject "${blueprint.name}" references unknown section "${blueprint.sectionKey}".`,
        );
      }
      const supervisor = context.supervisors.require(
        sectionBlueprint.supervisorKey,
      );

      const { entity, created } = await upsertBy(
        manager,
        SectionSubject,
        {
          section: { id: section.id },
          subject: { id: subject.id },
          academicYear: { id: academicYear.id },
        },
        () => ({ section, subject, supervisor, academicYear }),
      );
      if (created) {
        context.logger.created(
          'section subject',
          `${blueprint.name} in ${sectionBlueprint.name}`,
        );
      }
      context.sectionSubjects.set(blueprint.key, entity);
    }
  }
}
