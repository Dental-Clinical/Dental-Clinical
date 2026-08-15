import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { SupervisorService } from 'src/supervisors/supervisor.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const service = app.get(SupervisorService);
  const dataSource = app.get(DataSource);

  const rows: { user_id: number; supervisor_id: number }[] =
    await dataSource.query(`
      SELECT DISTINCT s."userId" AS user_id, s.id AS supervisor_id
      FROM supervisors s
      JOIN diagnosis_submissions ds ON ds.supervisor_id = s.id
      WHERE ds.status IN ('pending_review','approved')
      ORDER BY s.id
    `);

  for (const row of rows) {
    const result = await service.getAssignedClinicalCases({
      userId: Number(row.user_id),
      role: 'supervisor',
      jti: 'verify',
    });
    const evaluated = result.cases.filter((c) => c.evaluation !== null);
    console.log(
      `supervisor_id=${row.supervisor_id} cases=${result.cases.length} evaluated=${evaluated.length}`,
    );
    for (const c of result.cases) {
      console.log(
        `  case ${c.id} status=${c.status} evaluation=${
          c.evaluation
            ? `{id:${c.evaluation.id}, grade:${c.evaluation.grade}, comment:${
                c.evaluation.comment === null
                  ? 'null'
                  : JSON.stringify(c.evaluation.comment.slice(0, 20) + '...')
              }, createdAt:${c.evaluation.createdAt.toISOString()}}`
            : 'null'
        }`,
      );
    }
  }

  await app.close();
}

main().catch((err) => {
  console.error('VERIFY_FAILED', err);
  process.exit(1);
});
