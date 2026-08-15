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

  const rows: { user_id: number }[] = await dataSource.query(`
    SELECT s."userId" AS user_id
    FROM supervisors s
    JOIN section_subjects ss ON ss.supervisor_id = s.id
    JOIN academic_years ay ON ay.id = ss.academic_year_id AND ay.is_active = true
    LIMIT 1
  `);
  if (rows.length === 0) {
    console.log('NO_SUPERVISOR_FOUND');
  } else {
    const result = await service.getDashboard({
      userId: Number(rows[0].user_id),
      role: 'supervisor',
      jti: 'verify',
    });
    console.log(JSON.stringify(result, null, 2));
  }
  await app.close();
}

main().catch((err) => {
  console.error('VERIFY_FAILED', err);
  process.exit(1);
});
