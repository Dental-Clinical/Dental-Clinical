import { EntityManager } from 'typeorm';
import { CoordinatorSchedule } from 'src/coordinator-schedules/coordniator-schedule.entity';
import { SupervisorSchedule } from 'src/supervisor-schedules/supervisor-schedules.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { CLINIC_DAYS } from '../support/clock.helper';
import { COORDINATOR, SUPERVISORS } from '../data/people.data';

const CLINIC_OPENS = '09:00';
const CLINIC_CLOSES = '15:00';
/** Examination slots the coordinator's booking grid is generated from. */
const EXAMINATION_SLOT_MINUTES = 30;

/**
 * Weekly availability, Sunday to Thursday.
 *
 * Without this, the booking screens have no grid to draw and the slot generator
 * returns nothing — the seeded appointments would exist while the UI that
 * creates new ones stayed empty.
 */
export class ScheduleSeeder implements Seeder {
  readonly name = 'weekly schedules';

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const coordinator = context.coordinators.require(COORDINATOR.key);

    for (const day of CLINIC_DAYS) {
      await upsertBy(
        manager,
        CoordinatorSchedule,
        { coordinator: { id: coordinator.id }, day_of_week: day },
        () => ({
          coordinator,
          day_of_week: day,
          start_time: CLINIC_OPENS,
          end_time: CLINIC_CLOSES,
          slot_duration: EXAMINATION_SLOT_MINUTES,
          is_active: true,
        }),
      );

      for (const blueprint of SUPERVISORS) {
        const supervisor = context.supervisors.require(blueprint.key);
        await upsertBy(
          manager,
          SupervisorSchedule,
          { supervisor: { id: supervisor.id }, day_of_week: day },
          () => ({
            supervisor,
            day_of_week: day,
            start_time: CLINIC_OPENS,
            end_time: CLINIC_CLOSES,
            is_active: true,
          }),
        );
      }
    }

    context.logger.step(
      `${CLINIC_DAYS.length} clinic days × ${SUPERVISORS.length + 1} staff, ${CLINIC_OPENS}–${CLINIC_CLOSES}`,
    );
  }
}
