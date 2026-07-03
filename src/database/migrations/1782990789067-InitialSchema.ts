import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782990789067 implements MigrationInterface {
  name = 'InitialSchema1782990789067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coordinator_schedules" ADD CONSTRAINT "UQ_6703ffb128516d160e6ccc0df6c" UNIQUE ("coordinator_id", "day_of_week")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coordinator_schedules" DROP CONSTRAINT "UQ_6703ffb128516d160e6ccc0df6c"`,
    );
  }
}
