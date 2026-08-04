import { EntityManager } from 'typeorm';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { StudentSection } from 'src/student-section/student-section.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { STUDENTS } from '../data/people.data';

/**
 * Places every student in the current academic year, a study year and a clinic
 * section.
 *
 * This is the join that decides which supervisor ends up on a student's cases,
 * so it must exist before any case is assigned — the case seeder resolves the
 * supervisor through the student's section rather than picking one at random.
 */
export class EnrollmentSeeder implements Seeder {
  readonly name = 'student enrollments';

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const academicYear = context.academicYears.require('current');

    for (const blueprint of STUDENTS) {
      const student = context.students.require(blueprint.key);
      const studyYear = context.studyYears.require(blueprint.studyYearKey);
      const section = context.sections.require(blueprint.sectionKey);

      const { entity: enrollment } = await upsertBy(
        manager,
        StudentAcademicYear,
        {
          student: { id: student.id },
          academicYear: { id: academicYear.id },
        },
        () => ({
          student,
          academicYear,
          studyYear,
          isCurrent: true,
        }),
      );
      context.enrollments.set(blueprint.key, enrollment);

      await upsertBy(
        manager,
        StudentSection,
        {
          studentAcademicYear: { id: enrollment.id },
          clinicSection: { id: section.id },
        },
        () => ({ studentAcademicYear: enrollment, clinicSection: section }),
      );
    }

    context.logger.step(
      `${STUDENTS.length} students enrolled in ${academicYear.label}`,
    );
  }
}
