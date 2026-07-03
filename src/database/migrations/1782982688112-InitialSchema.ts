import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782982688112 implements MigrationInterface {
  name = 'InitialSchema1782982688112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."coordinator_schedules_day_of_week_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "coordinator_schedules" ("id" SERIAL NOT NULL, "day_of_week" "public"."coordinator_schedules_day_of_week_enum" NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "slot_duration" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "coordinator_id" integer, CONSTRAINT "PK_d3515501e198f923c6ae937247f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "coordinator_schedules" ADD CONSTRAINT "FK_08935b3c9b231dcd47f8f52156d" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coordinator_schedules" DROP CONSTRAINT "FK_08935b3c9b231dcd47f8f52156d"`,
    );
    await queryRunner.query(`DROP TABLE "coordinator_schedules"`);
    await queryRunner.query(
      `DROP TYPE "public"."coordinator_schedules_day_of_week_enum"`,
    );
  }
}
