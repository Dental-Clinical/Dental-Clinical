import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { ClinicalCaseService } from 'src/clinical-case/clinical-case.service';

type Row = {
  case_id: number;
  status: string;
  supervisor_user_id: number | null;
  student_user_id: number | null;
  patient_user_id: number | null;
  evaluation_id: number | null;
};

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const service = app.get(ClinicalCaseService);
  const dataSource = app.get(DataSource);

  // One graded case and one ungraded case, with each actor's user id.
  const rows: Row[] = await dataSource.query(`
    SELECT cc.id AS case_id,
           cc.status,
           sup_u.id AS supervisor_user_id,
           stu_u.id AS student_user_id,
           pat_u.id AS patient_user_id,
           ev.id    AS evaluation_id
    FROM clinical_cases cc
    LEFT JOIN supervisors sup ON sup.id = cc.assigned_supervisor_id
    LEFT JOIN users sup_u     ON sup_u.id = sup."userId"
    LEFT JOIN students stu    ON stu.id = cc.assigned_student_id
    LEFT JOIN users stu_u     ON stu_u.id = stu."userId"
    LEFT JOIN patients pat    ON pat.id = cc.patient_id
    LEFT JOIN users pat_u     ON pat_u.id = pat."userId"
    LEFT JOIN clinical_case_evaluations ev ON ev.clinical_case_id = cc.id
    WHERE cc.assigned_supervisor_id IS NOT NULL
      AND cc.assigned_student_id IS NOT NULL
    ORDER BY (ev.id IS NULL), cc.id
  `);

  const graded = rows.find((r) => r.evaluation_id !== null);
  const ungraded = rows.find((r) => r.evaluation_id === null);

  let failures = 0;
  const check = (label: string, ok: boolean, detail: unknown) => {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label} :: ${JSON.stringify(detail)}`);
    if (!ok) failures++;
  };

  for (const [kind, row] of [
    ['graded', graded],
    ['ungraded', ungraded],
  ] as const) {
    if (!row) {
      console.log(`SKIP no ${kind} case in the seeded data`);
      continue;
    }
    console.log(`\n--- ${kind} case ${row.case_id} (status=${row.status}) ---`);

    const sup = await service.findSupervisorCaseDetails(
      row.case_id,
      row.supervisor_user_id!,
    );
    const stu = await service.findStudentCaseDetails(
      row.case_id,
      row.student_user_id!,
    );
    const pat = row.patient_user_id
      ? await service.findPatientCaseDetails(row.case_id, row.patient_user_id)
      : null;

    const expectPopulated = kind === 'graded';
    check(
      `${kind}/supervisor evaluation ${expectPopulated ? 'populated' : 'null'}`,
      expectPopulated ? sup.evaluation != null : sup.evaluation === null,
      sup.evaluation,
    );
    check(
      `${kind}/student evaluation ${expectPopulated ? 'populated' : 'null'}`,
      expectPopulated ? stu.evaluation != null : stu.evaluation === null,
      stu.evaluation,
    );
    if (pat) {
      check(
        `${kind}/patient evaluation key absent`,
        !('evaluation' in pat),
        Object.keys(pat),
      );
    } else {
      console.log('SKIP patient view (no patient user)');
    }

    if (expectPopulated) {
      check(
        `${kind}/supervisor+student agree`,
        JSON.stringify(sup.evaluation) === JSON.stringify(stu.evaluation),
        { sup: sup.evaluation, stu: stu.evaluation },
      );
      check(
        `${kind}/evaluation id matches DB`,
        sup.evaluation?.id === row.evaluation_id,
        { got: sup.evaluation?.id, want: row.evaluation_id },
      );
    }
  }

  await app.close();
  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} FAILED`}`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error('VERIFY_FAILED', err);
  process.exit(1);
});
