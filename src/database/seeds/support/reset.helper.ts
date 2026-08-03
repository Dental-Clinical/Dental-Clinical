import { DataSource } from 'typeorm';
import { SeedConfig } from '../seed.config';
import { SeedLogger } from './seed-logger';

/**
 * Tables owned by the seed, child-first. TRUNCATE ... CASCADE would handle the
 * order on its own, but listing them explicitly documents the blast radius and
 * makes an accidental table addition visible in review rather than at runtime.
 */
const SEEDED_TABLES = [
  'student_subject_procedure_progress',
  'clinical_case_evaluations',
  'clinical_case_media',
  'session_materials',
  'session_procedures',
  'treatment_sessions',
  'clinical_appointments',
  'supervisor_reviews',
  'planned_procedures',
  'diagnosis_images',
  'diagnosis_submissions',
  'clinical_cases',
  'initial_examinations',
  'examination_appointments',
  'examination_request_teeth',
  'examination_request_attachments',
  'examination_request',
  'student_sections',
  'student_academic_years',
  'subject_materials',
  'materials',
  'subject_procedures',
  'subjects',
  'clinic_sections',
  'study_years',
  'academic_years',
  'coordinator_schedules',
  'supervisor_schedules',
  'sessions',
  'patients',
  'students',
  'supervisors',
  'coordinators',
  'users',
];

export async function resetSeededTables(
  dataSource: DataSource,
  config: SeedConfig,
  logger: SeedLogger,
): Promise<void> {
  if (process.env.NODE_ENV === 'production' && !config.force) {
    throw new Error(
      'Refusing to reset seeded tables with NODE_ENV=production. ' +
        'Set SEED_FORCE=true only if you are certain this database is disposable.',
    );
  }

  logger.section('Resetting seeded tables');

  const existing: string[] = [];
  for (const table of SEEDED_TABLES) {
    const [{ exists }] = await dataSource.query(
      `SELECT to_regclass($1) IS NOT NULL AS exists`,
      [`public.${table}`],
    );
    if (exists) existing.push(table);
    else logger.warn(`table "${table}" does not exist — skipped`);
  }

  // One statement: a single lock acquisition and no ordering concerns.
  await dataSource.query(
    `TRUNCATE TABLE ${existing
      .map((table) => `"${table}"`)
      .join(', ')} RESTART IDENTITY CASCADE`,
  );

  logger.step(`truncated ${existing.length} tables`);
}
