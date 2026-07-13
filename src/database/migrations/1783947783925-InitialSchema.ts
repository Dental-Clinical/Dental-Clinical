import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783947783925 implements MigrationInterface {
    name = 'InitialSchema1783947783925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subject_procedures" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "required_count" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "subject_id" integer, CONSTRAINT "UQ_3b70abafb463e390cee88f6b46c" UNIQUE ("subject_id", "name"), CONSTRAINT "PK_e66edc823bc327de51a93438b9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "planned_procedures" ("id" SERIAL NOT NULL, "tooth_number" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "subject_procedure_id" integer, "diagnosis_submission_id" integer, CONSTRAINT "PK_11370b8f3bd98c0e9e4984d8a02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "diagnosis_images" ("id" SERIAL NOT NULL, "file_path" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "diagnosis_submission_id" integer, CONSTRAINT "PK_c09d74f826d6a1aa1379203fc4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."diagnosis_submissions_status_enum" AS ENUM('submitted', 'approved', 'rejected', 'revision_required')`);
        await queryRunner.query(`CREATE TABLE "diagnosis_submissions" ("id" SERIAL NOT NULL, "clinical_impression" text NOT NULL, "status" "public"."diagnosis_submissions_status_enum" NOT NULL DEFAULT 'submitted', "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "clinical_case_id" integer, "student_id" integer, "supervisor_id" integer, CONSTRAINT "REL_d7fee634c8de63615fbb0f0cb5" UNIQUE ("clinical_case_id"), CONSTRAINT "PK_809b42987cca770598dfb52f855" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "required_cases"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD "assigned_supervisor_id" integer`);
        await queryRunner.query(`ALTER TABLE "subject_procedures" ADD CONSTRAINT "FK_510bb9b4263a96f284a0055a653" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD CONSTRAINT "FK_be5117c75eaffd966f899db2457" FOREIGN KEY ("subject_procedure_id") REFERENCES "subject_procedures"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD CONSTRAINT "FK_6f1c4fda392e7c40a7e5335eeab" FOREIGN KEY ("diagnosis_submission_id") REFERENCES "diagnosis_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "diagnosis_images" ADD CONSTRAINT "FK_03bb4842269df0b820bf70c7a6f" FOREIGN KEY ("diagnosis_submission_id") REFERENCES "diagnosis_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ADD CONSTRAINT "FK_d7fee634c8de63615fbb0f0cb56" FOREIGN KEY ("clinical_case_id") REFERENCES "clinical_cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ADD CONSTRAINT "FK_1f1311b96b7fd1998c3e0d47647" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ADD CONSTRAINT "FK_2e3a2d6d2e334de71dded709126" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_d3b63a2366d32ce63ce4cdf1f74" FOREIGN KEY ("assigned_supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_d3b63a2366d32ce63ce4cdf1f74"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" DROP CONSTRAINT "FK_2e3a2d6d2e334de71dded709126"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" DROP CONSTRAINT "FK_1f1311b96b7fd1998c3e0d47647"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" DROP CONSTRAINT "FK_d7fee634c8de63615fbb0f0cb56"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_images" DROP CONSTRAINT "FK_03bb4842269df0b820bf70c7a6f"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP CONSTRAINT "FK_6f1c4fda392e7c40a7e5335eeab"`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP CONSTRAINT "FK_be5117c75eaffd966f899db2457"`);
        await queryRunner.query(`ALTER TABLE "subject_procedures" DROP CONSTRAINT "FK_510bb9b4263a96f284a0055a653"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP COLUMN "assigned_supervisor_id"`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "required_cases" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "diagnosis_submissions"`);
        await queryRunner.query(`DROP TYPE "public"."diagnosis_submissions_status_enum"`);
        await queryRunner.query(`DROP TABLE "diagnosis_images"`);
        await queryRunner.query(`DROP TABLE "planned_procedures"`);
        await queryRunner.query(`DROP TABLE "subject_procedures"`);
    }

}
