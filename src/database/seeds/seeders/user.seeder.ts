import { EntityManager } from 'typeorm';
import { Coordinator } from 'src/coordinators/coordinator.entity';
import { Student } from 'src/students/student.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { User } from 'src/users/user.entity';
import { Seeder } from '../seeder.interface';
import { SeedContext } from '../seed-context';
import { ensure, upsertBy } from '../support/persistence.helper';
import { PasswordVault } from '../support/password.helper';
import {
  ADMIN,
  COORDINATOR,
  StaffBlueprint,
  STUDENTS,
  SUPERVISORS,
} from '../data/people.data';

/**
 * Accounts and role profiles.
 *
 * Idempotency key is the email address: it is the login identifier, it is
 * unique in the schema, and it is stable across runs — so re-running the seed
 * finds the same people rather than colliding on the unique index.
 */
export class UserSeeder implements Seeder {
  readonly name = 'users';

  constructor(private readonly passwords: PasswordVault) {}

  async run(context: SeedContext, manager: EntityManager): Promise<void> {
    const passwordHash = await this.passwords.hash();

    await this.createUser(context, manager, ADMIN, passwordHash);

    const coordinatorUser = await this.createUser(
      context,
      manager,
      COORDINATOR,
      passwordHash,
    );
    const coordinator = await ensure(
      manager,
      Coordinator,
      { user: { id: coordinatorUser.id } },
      () => ({ user: coordinatorUser }),
    );
    context.coordinators.set(COORDINATOR.key, coordinator);

    for (const blueprint of SUPERVISORS) {
      const user = await this.createUser(
        context,
        manager,
        blueprint,
        passwordHash,
      );
      const supervisor = await ensure(
        manager,
        Supervisor,
        { user: { id: user.id } },
        () => ({ user }),
      );
      context.supervisors.set(blueprint.key, supervisor);
    }

    for (const blueprint of STUDENTS) {
      const user = await this.createUser(
        context,
        manager,
        blueprint,
        passwordHash,
      );
      const student = await ensure(
        manager,
        Student,
        { user: { id: user.id } },
        () => ({ user, university_id: blueprint.universityId }),
      );
      context.students.set(blueprint.key, student);
    }

    context.logger.step(
      `${SUPERVISORS.length} supervisors, ${STUDENTS.length} students, 1 coordinator, 1 admin`,
    );
  }

  private async createUser(
    context: SeedContext,
    manager: EntityManager,
    blueprint: StaffBlueprint,
    passwordHash: string,
  ): Promise<User> {
    const { entity, created } = await upsertBy(
      manager,
      User,
      { email: blueprint.email },
      () => ({
        full_name: blueprint.fullName,
        father_name: blueprint.fatherName,
        email: blueprint.email,
        phone: blueprint.phone,
        password_hash: passwordHash,
        role: blueprint.role,
        is_active: true,
      }),
    );

    if (created) {
      context.logger.created(
        'user',
        `${blueprint.fullName} (${blueprint.role})`,
      );
    }
    context.users.set(blueprint.key, entity);
    return entity;
  }
}
