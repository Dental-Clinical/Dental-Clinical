import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { TreatmentSessionsService } from './src/treatment-sessions/treatment-sessions.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const service = app.get(TreatmentSessionsService);

  const patient = { userId: 16, role: 'patient', jti: 'x' } as any;

  const list = await service.getAllTreatmentSessions(patient);
  console.log('=== LIST (user 16) ===');
  console.log(JSON.stringify(list, null, 2));

  const firstId = list.sessions[0]?.id;
  if (firstId) {
    console.log('=== DETAILS (session ' + firstId + ') ===');
    console.log(
      JSON.stringify(await service.getTreatmentSession(patient, firstId), null, 2),
    );
  }

  // a completed session for this patient, to exercise the procedures mapping
  const completed = list.sessions.find((s) => s.status === 'completed');
  if (completed && completed.id !== firstId) {
    console.log('=== DETAILS completed (session ' + completed.id + ') ===');
    console.log(
      JSON.stringify(
        await service.getTreatmentSession(patient, completed.id),
        null,
        2,
      ),
    );
  }

  // ownership: another patient's session must 403, unknown id must 404
  const other = { userId: 19, role: 'patient', jti: 'x' } as any;
  for (const [label, user, id] of [
    ['foreign session', other, firstId],
    ['unknown session', patient, 999999],
  ] as const) {
    try {
      await service.getTreatmentSession(user, id);
      console.log(label + ': NO ERROR (unexpected)');
    } catch (e: any) {
      console.log(label + ':', e.constructor.name, '-', e.message);
    }
  }

  // empty state: a user with no sessions
  console.log(
    'empty state:',
    JSON.stringify(
      await service.getAllTreatmentSessions({ userId: 1, role: 'patient' } as any),
    ),
  );

  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
