import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785433038368 implements MigrationInterface {
  name = 'InitialSchema1785433038368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" ADD "dateOfBirth" date`);
    await queryRunner.query(
      `CREATE TYPE "public"."patients_gender_enum" AS ENUM('Male', 'Female', 'male', 'female')`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD "gender" "public"."patients_gender_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."clinical_cases_status_enum" RENAME TO "clinical_cases_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."clinical_cases_status_enum" AS ENUM('open', 'assigned', 'diagnosis_pending_review', 'treatment_in_progress', 'awaiting_case_review', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_cases" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_cases" ALTER COLUMN "status" TYPE "public"."clinical_cases_status_enum" USING "status"::"text"::"public"."clinical_cases_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_cases" ALTER COLUMN "status" SET DEFAULT 'open'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."clinical_cases_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."clinical_cases_status_enum_old" AS ENUM('open', 'assigned', 'diagnosis_pending_review', 'treatment_in_progress', 'procedure_pending_review', 'completed', 'closed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_cases" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_cases" ALTER COLUMN "status" TYPE "public"."clinical_cases_status_enum_old" USING "status"::"text"::"public"."clinical_cases_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_cases" ALTER COLUMN "status" SET DEFAULT 'open'`,
    );
    await queryRunner.query(`DROP TYPE "public"."clinical_cases_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."clinical_cases_status_enum_old" RENAME TO "clinical_cases_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."patients_gender_enum"`);
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "dateOfBirth"`);
  }
}
