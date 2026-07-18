import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784363032555 implements MigrationInterface {
    name = 'InitialSchema1784363032555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supervisor_reviews" ("id" SERIAL NOT NULL, "notes" text, "reviewed_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "diagnosis_submission_id" integer, "supervisor_id" integer, CONSTRAINT "UQ_3f339346be7755dbbea97c9a776" UNIQUE ("diagnosis_submission_id"), CONSTRAINT "REL_3f339346be7755dbbea97c9a77" UNIQUE ("diagnosis_submission_id"), CONSTRAINT "PK_7290a0d1563f11db02fa2a4a0a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."diagnosis_submissions_status_enum" RENAME TO "diagnosis_submissions_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."diagnosis_submissions_status_enum" AS ENUM('pending_review', 'approved')`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" TYPE "public"."diagnosis_submissions_status_enum" USING "status"::"text"::"public"."diagnosis_submissions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" SET DEFAULT 'pending_review'`);
        await queryRunner.query(`DROP TYPE "public"."diagnosis_submissions_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "supervisor_reviews" ADD CONSTRAINT "FK_3f339346be7755dbbea97c9a776" FOREIGN KEY ("diagnosis_submission_id") REFERENCES "diagnosis_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supervisor_reviews" ADD CONSTRAINT "FK_493e9caccd4b336bf44e1888c7b" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supervisor_reviews" DROP CONSTRAINT "FK_493e9caccd4b336bf44e1888c7b"`);
        await queryRunner.query(`ALTER TABLE "supervisor_reviews" DROP CONSTRAINT "FK_3f339346be7755dbbea97c9a776"`);
        await queryRunner.query(`CREATE TYPE "public"."diagnosis_submissions_status_enum_old" AS ENUM('pending_review', 'approved', 'rejected', 'revision_required')`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" TYPE "public"."diagnosis_submissions_status_enum_old" USING "status"::"text"::"public"."diagnosis_submissions_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" SET DEFAULT 'pending_review'`);
        await queryRunner.query(`DROP TYPE "public"."diagnosis_submissions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."diagnosis_submissions_status_enum_old" RENAME TO "diagnosis_submissions_status_enum"`);
        await queryRunner.query(`DROP TABLE "supervisor_reviews"`);
    }

}
