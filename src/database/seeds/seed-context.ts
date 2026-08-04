import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { Material } from 'src/materials/materials.entity';
import { Patient } from 'src/patients/patient.entity';
import { Student } from 'src/students/student.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { StudyYear } from 'src/study-years/study-years.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { User } from 'src/users/user.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { SeedConfig } from './seed.config';
import { Registry } from './support/registry';
import { SeedClock } from './support/clock.helper';
import { SeedLogger } from './support/seed-logger';
import { MediaFactory } from './support/media.helper';

/**
 * The single object handed to every seeder.
 *
 * Seeders never import each other and never re-query for entities another
 * seeder produced: they publish into the typed registries here and resolve
 * dependencies through them by stable string key. That is what keeps the
 * pipeline a dependency *graph* instead of a chain of imports, and it is why a
 * missing dependency fails loudly (`Registry.require`) at the exact seeder that
 * needs it.
 */
export class SeedContext {
  readonly users = new Registry<User>('user');
  readonly students = new Registry<Student>('student');
  readonly supervisors = new Registry<Supervisor>('supervisor');
  readonly coordinators = new Registry<Coordinator>('coordinator');
  readonly patients = new Registry<Patient>('patient');

  readonly academicYears = new Registry<AcademicYear>('academic year');
  readonly studyYears = new Registry<StudyYear>('study year');
  readonly sections = new Registry<ClinicSections>('clinic section');
  readonly subjects = new Registry<Subject>('subject');
  readonly subjectProcedures = new Registry<SubjectProcedures>(
    'subject procedure',
  );
  readonly materials = new Registry<Material>('material');
  readonly enrollments = new Registry<StudentAcademicYear>('enrollment');

  readonly clinicalCases = new Registry<ClinicalCase>('clinical case');

  readonly clock: SeedClock;
  readonly media: MediaFactory;

  constructor(
    readonly config: SeedConfig,
    readonly logger: SeedLogger,
  ) {
    this.clock = new SeedClock(config.anchor);
    this.media = new MediaFactory(config);
  }

  /** Resolves `subjectKey:procedureName` to the catalogue row. */
  requireProcedure(subjectKey: string, procedureName: string) {
    return this.subjectProcedures.require(`${subjectKey}:${procedureName}`);
  }
}
