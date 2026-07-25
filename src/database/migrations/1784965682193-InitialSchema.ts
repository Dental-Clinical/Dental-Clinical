import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784965682193 implements MigrationInterface {
    name = 'InitialSchema1784965682193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "planned_procedures" RENAME COLUMN "completed_at" TO "status"`);
        await queryRunner.query(`ALTER TABLE "session_procedures" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" ADD "supervisorNotes" text`);
        await queryRunner.query(`ALTER TYPE "public"."treatment_sessions_status_enum" ADD VALUE 'upcoming'`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."planned_procedures_status_enum" AS ENUM('planned', 'in_progress', 'completed')`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD "status" "public"."planned_procedures_status_enum" NOT NULL DEFAULT 'planned'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."planned_procedures_status_enum"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD "status" TIMESTAMP`);
        await queryRunner.query(`CREATE TYPE "public"."treatment_sessions_status_enum_old" AS ENUM('active', 'completed', 'patient_absent')`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" ALTER COLUMN "status" TYPE "public"."treatment_sessions_status_enum_old" USING "status"::"text"::"public"."treatment_sessions_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."treatment_sessions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."treatment_sessions_status_enum_old" RENAME TO "treatment_sessions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" DROP COLUMN "supervisorNotes"`);
        await queryRunner.query(`ALTER TABLE "session_procedures" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" RENAME COLUMN "status" TO "completed_at"`);
    }

}
