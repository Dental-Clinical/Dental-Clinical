import { EntityManager } from 'typeorm';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { STUDENTS } from '../data/people.data';
import { SUBJECTS } from '../data/academic.data';

/**
 * Places every student in the current academic year and enrols them in the
 * subjects they take.
 *
 * Two records, because they answer different questions. StudentAcademicYear
 * says which year of the programme the student is in — their level.
 * StudentSubjectEnrollment says which subjects they take and in which section,
 * and it is the join that decides which supervisor ends up on their cases, so
 * it must exist before any case is assigned.
 *
 * A student's subjects are implied rather than listed: they take whatever is
 * taught in their section at their study year.
 */
export class EnrollmentSeeder implements Seeder {
  readonly name = 'student enrollments';

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const academicYear = context.academicYears.require('current');
    let subjectEnrollments = 0;

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

      const taughtToThem = SUBJECTS.filter(
        (subject) =>
          subject.sectionKey === blueprint.sectionKey &&
          subject.studyYearKey === blueprint.studyYearKey,
      );

      if (taughtToThem.length === 0) {
        throw new Error(
          `No subject is taught in ${blueprint.sectionKey} at ${blueprint.studyYearKey}, ` +
            `so ${blueprint.fullName} would have nothing to enrol in.`,
        );
      }

      for (const subjectBlueprint of taughtToThem) {
        const subject = context.subjects.require(subjectBlueprint.key);

        const { entity: subjectEnrollment } = await upsertBy(
          manager,
          StudentSubjectEnrollment,
          {
            student: { id: student.id },
            subject: { id: subject.id },
            academicYear: { id: academicYear.id },
          },
          () => ({ student, subject, section, academicYear }),
        );
        context.subjectEnrollments.set(
          `${blueprint.key}:${subjectBlueprint.key}`,
          subjectEnrollment,
        );
        subjectEnrollments += 1;
      }
    }

    context.logger.step(
      `${STUDENTS.length} students enrolled in ${academicYear.label} ` +
        `across ${subjectEnrollments} subject enrollments`,
    );
  }
}
