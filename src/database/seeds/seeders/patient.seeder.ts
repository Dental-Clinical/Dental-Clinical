import { EntityManager } from 'typeorm';
import { Patient } from 'src/patients/patient.entity';
import { User } from 'src/users/user.entity';
import { UserRole } from 'src/constants/user-roles';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { upsertBy } from '../support/persistence.helper';
import { PasswordVault } from '../support/password.helper';
import { PATIENTS, PatientBlueprint } from '../data/patients.data';

/**
 * Patients, with a login for everyone except the walk-in.
 *
 * The walk-in has no `User` row on purpose: the patient portal and the
 * coordinator's desk registration are two different entry points, and a
 * frontend that assumes `patient.user` is always present will break in
 * production. Better it breaks against seed data first.
 */
export class PatientSeeder implements Seeder {
  readonly name = 'patients';

  constructor(private readonly passwords: PasswordVault) {}

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const passwordHash = await this.passwords.hash();

    for (const [index, blueprint] of PATIENTS.entries()) {
      const user = blueprint.isWalkin
        ? undefined
        : await this.createPortalAccount(manager, blueprint, passwordHash);

      const { entity, created } = await upsertBy(
        manager,
        Patient,
        { phone: blueprint.phone },
        () => ({
          user,
          full_name: blueprint.fullName,
          phone: blueprint.phone,
          dateOfBirth: context.clock.dateOnly(
            this.dateOfBirth(context, blueprint.age, index),
          ),
          gender: blueprint.gender,
          is_walkin: blueprint.isWalkin,
          medical_history: blueprint.medicalHistory,
          allergies: blueprint.allergies,
          current_medications: blueprint.currentMedications,
        }),
      );

      if (created) {
        context.logger.created(
          'patient',
          `${blueprint.fullName}${blueprint.isWalkin ? ' (walk-in)' : ''}`,
        );
      }
      context.patients.set(blueprint.key, entity);
    }
  }

  private async createPortalAccount(
    manager: EntityManager,
    blueprint: PatientBlueprint,
    passwordHash: string,
  ): Promise<User> {
    const email = `${blueprint.key.replace('patient.', '')}@patient.dental.edu`;
    const [firstName, ...rest] = blueprint.fullName.split(' ');

    const { entity } = await upsertBy(manager, User, { email }, () => ({
      full_name: blueprint.fullName,
      father_name: rest.join(' ') || firstName,
      email,
      phone: blueprint.phone,
      password_hash: passwordHash,
      role: UserRole.PATIENT,
      is_active: true,
    }));

    return entity;
  }

  /** Deterministic date of birth so re-runs never shift a patient's age. */
  private dateOfBirth(context: SeedContext, age: number, index: number): Date {
    const year = context.clock.today.getFullYear() - age;
    return new Date(year, index % 12, ((index * 7) % 28) + 1);
  }
}
