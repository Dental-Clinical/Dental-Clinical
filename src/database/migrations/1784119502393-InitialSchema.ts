import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784119502393 implements MigrationInterface {
    name = 'InitialSchema1784119502393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clinic_sections" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "subject_id" integer, "supervisor_id" integer, CONSTRAINT "PK_d713611f0a1b4ca08464dd81d25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_sections" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "student_academic_year_id" integer NOT NULL, "clinic_section_id" integer NOT NULL, CONSTRAINT "UQ_ed01ac199edba67c1f13f9cd473" UNIQUE ("student_academic_year_id", "clinic_section_id"), CONSTRAINT "PK_a47e76e78681b091b3e35dfdd1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "supervisor_schedules" DROP COLUMN "slot_duration"`);
        await queryRunner.query(`ALTER TYPE "public"."diagnosis_submissions_status_enum" RENAME TO "diagnosis_submissions_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."diagnosis_submissions_status_enum" AS ENUM('pending_review', 'approved', 'rejected', 'revision_required')`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" TYPE "public"."diagnosis_submissions_status_enum" USING "status"::"text"::"public"."diagnosis_submissions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" SET DEFAULT 'pending_review'`);
        await queryRunner.query(`DROP TYPE "public"."diagnosis_submissions_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP COLUMN "tooth_number"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD "tooth_number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinic_sections" ADD CONSTRAINT "FK_5592c7c93da81527d2b4a497fd8" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinic_sections" ADD CONSTRAINT "FK_600db073d2ce091383703702f9f" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_sections" ADD CONSTRAINT "FK_c1aef178d0255a64ee4834263bc" FOREIGN KEY ("student_academic_year_id") REFERENCES "student_academic_years"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_sections" ADD CONSTRAINT "FK_19bb50e549ae97335edbef55b08" FOREIGN KEY ("clinic_section_id") REFERENCES "clinic_sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_sections" DROP CONSTRAINT "FK_19bb50e549ae97335edbef55b08"`);
        await queryRunner.query(`ALTER TABLE "student_sections" DROP CONSTRAINT "FK_c1aef178d0255a64ee4834263bc"`);
        await queryRunner.query(`ALTER TABLE "clinic_sections" DROP CONSTRAINT "FK_600db073d2ce091383703702f9f"`);
        await queryRunner.query(`ALTER TABLE "clinic_sections" DROP CONSTRAINT "FK_5592c7c93da81527d2b4a497fd8"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP COLUMN "tooth_number"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD "tooth_number" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."diagnosis_submissions_status_enum_old" AS ENUM('submitted', 'approved', 'rejected', 'revision_required')`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" TYPE "public"."diagnosis_submissions_status_enum_old" USING "status"::"text"::"public"."diagnosis_submissions_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ALTER COLUMN "status" SET DEFAULT 'submitted'`);
        await queryRunner.query(`DROP TYPE "public"."diagnosis_submissions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."diagnosis_submissions_status_enum_old" RENAME TO "diagnosis_submissions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "supervisor_schedules" ADD "slot_duration" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "student_sections"`);
        await queryRunner.query(`DROP TABLE "clinic_sections"`);
    }

}
