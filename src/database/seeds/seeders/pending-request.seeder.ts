import { EntityManager } from 'typeorm';
import { ExaminationRequest } from 'src/examination-requests/entities/examination-request.entity';
import { ExaminationRequestStatus } from 'src/examination-requests/Enums/examination-request.enum';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { COORDINATOR } from '../data/people.data';
import { PENDING_REQUESTS } from '../data/scenarios.data';
import { ExaminationSeeder } from './examination.seeder';

/**
 * Requests that have not been converted into cases yet.
 *
 * Without these the coordinator's queue is empty the moment the seed finishes —
 * every request would already be a case — and the intake screens would have
 * nothing to show. One request is already booked, one is still waiting for a
 * slot, which are the two states that queue has to render.
 */
export class PendingRequestSeeder implements Seeder {
  readonly name = 'pending examination requests';

  constructor(private readonly examinations: ExaminationSeeder) {}

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const coordinator = context.coordinators.require(COORDINATOR.key);

    for (const blueprint of PENDING_REQUESTS) {
      const patient = context.patients.require(blueprint.patientKey);

      const existing = await manager.findOne(ExaminationRequest, {
        where: {
          patient_id: patient.id,
          chief_complaint: blueprint.request.chiefComplaint,
        },
      });
      if (existing) {
        context.logger.skipped(`${blueprint.title} already present`);
        continue;
      }

      const request = await this.examinations.seedRequest(context, manager, {
        scenarioKey: blueprint.key,
        patient,
        blueprint: blueprint.request,
        status: ExaminationRequestStatus.PENDING,
      });

      if (blueprint.examinationVisit) {
        await this.examinations.seedVisit(context, manager, {
          request,
          coordinator,
          blueprint: blueprint.examinationVisit,
        });
      }
    }
  }
}
