import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783498448065 implements MigrationInterface {
    name = 'InitialSchema1783498448065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student_academic_years" ("id" SERIAL NOT NULL, "isCurrent" boolean NOT NULL DEFAULT true, "enrolledAt" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "student_id" integer, "academic_year_id" integer, "study_year_id" integer, CONSTRAINT "UQ_36fedb1538d0ba32c3052070dd6" UNIQUE ("student_id", "academic_year_id"), CONSTRAINT "PK_0986815b6b8d11ac610cef0ae8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."examination_request_status_enum" RENAME TO "examination_request_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."examination_request_status_enum" AS ENUM('pending', 'converted_to_case')`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "status" TYPE "public"."examination_request_status_enum" USING "status"::"text"::"public"."examination_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."examination_request_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."clinical_cases_status_enum" RENAME TO "clinical_cases_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."clinical_cases_status_enum" AS ENUM('open', 'assigned', 'diagnosis_pending_review', 'treatment_in_progress', 'procedure_pending_review', 'completed', 'closed')`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "status" TYPE "public"."clinical_cases_status_enum" USING "status"::"text"::"public"."clinical_cases_status_enum"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`DROP TYPE "public"."clinical_cases_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "student_academic_years" ADD CONSTRAINT "FK_0c6767590801df1a056c6828508" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_academic_years" ADD CONSTRAINT "FK_8bde9ef0e1d1d7a1282d6f47607" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_academic_years" ADD CONSTRAINT "FK_402869c0ee41987e659a4bf6cb9" FOREIGN KEY ("study_year_id") REFERENCES "study_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_academic_years" DROP CONSTRAINT "FK_402869c0ee41987e659a4bf6cb9"`);
        await queryRunner.query(`ALTER TABLE "student_academic_years" DROP CONSTRAINT "FK_8bde9ef0e1d1d7a1282d6f47607"`);
        await queryRunner.query(`ALTER TABLE "student_academic_years" DROP CONSTRAINT "FK_0c6767590801df1a056c6828508"`);
        await queryRunner.query(`CREATE TYPE "public"."clinical_cases_status_enum_old" AS ENUM('open', 'assigned', 'in_treatment', 'completed')`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "status" TYPE "public"."clinical_cases_status_enum_old" USING "status"::"text"::"public"."clinical_cases_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`DROP TYPE "public"."clinical_cases_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."clinical_cases_status_enum_old" RENAME TO "clinical_cases_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."examination_request_status_enum_old" AS ENUM('pending', 'examined', 'rejected', 'converted_to_case')`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "status" TYPE "public"."examination_request_status_enum_old" USING "status"::"text"::"public"."examination_request_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."examination_request_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."examination_request_status_enum_old" RENAME TO "examination_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "student_academic_years"`);
    }

}
