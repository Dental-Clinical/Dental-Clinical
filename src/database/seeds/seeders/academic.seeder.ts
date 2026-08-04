import { EntityManager } from 'typeorm';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { STUDY_YEARS } from '../data/academic.data';

/**
 * The academic calendar: one active academic year derived from the seed anchor,
 * and the study years students are enrolled into.
 *
 * The academic year label is computed rather than hardcoded, so the dataset is
 * still "the current year" whenever the seed is re-run.
 */
export class AcademicSeeder implements Seeder {
  readonly name = 'academic calendar';

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const bounds = context.clock.academicYearBounds();

    const { entity: academicYear, created } = await upsertBy(
      manager,
      AcademicYear,
      { label: bounds.label },
      () => ({
        label: bounds.label,
        start_date: context.clock.dateOnly(bounds.start),
        end_date: context.clock.dateOnly(bounds.end),
        is_active: true,
      }),
    );
    if (created) context.logger.created('academic year', bounds.label);
    context.academicYears.set('current', academicYear);

    for (const blueprint of STUDY_YEARS) {
      const { entity, created: madeStudyYear } = await upsertBy(
        manager,
        StudyYear,
        { level: blueprint.level },
        () => ({ name: blueprint.name, level: blueprint.level }),
      );
      if (madeStudyYear) context.logger.created('study year', blueprint.name);
      context.studyYears.set(blueprint.key, entity);
    }
  }
}
