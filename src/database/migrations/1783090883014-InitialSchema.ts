import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783090883014 implements MigrationInterface {
    name = 'InitialSchema1783090883014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP CONSTRAINT "FK_7c608c681d15d8335292eb001f6"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" RENAME COLUMN "examinationRequestId" TO "request_id"`);
        await queryRunner.query(`CREATE TYPE "public"."examination_appointments_status_enum" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "examination_appointments" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "coordinator_id" integer, "status" "public"."examination_appointments_status_enum" NOT NULL, "appointment_datetime" date NOT NULL, CONSTRAINT "PK_f18833fe1fbd4d02d7e4389113d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD "symptoms" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ALTER COLUMN "request_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "chief_complaint" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."examination_request_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD "status" "public"."examination_request_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "created_by_student" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD CONSTRAINT "FK_27fc2b39f4f76d45ca2cade5179" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD CONSTRAINT "FK_2a2cb10c27a1c71ab9700a83637" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD CONSTRAINT "FK_c315c58258325dfe8ce8c2b6670" FOREIGN KEY ("created_by_student") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" ADD CONSTRAINT "FK_3a1e57d4133f9f39b4ffd0afda8" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" ADD CONSTRAINT "FK_24cd28b09c0455d11469f95b80d" FOREIGN KEY ("coordinator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" ADD CONSTRAINT "FK_b36a8c366ad87a728458275b99b" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" DROP CONSTRAINT "FK_b36a8c366ad87a728458275b99b"`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" DROP CONSTRAINT "FK_24cd28b09c0455d11469f95b80d"`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" DROP CONSTRAINT "FK_3a1e57d4133f9f39b4ffd0afda8"`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP CONSTRAINT "FK_c315c58258325dfe8ce8c2b6670"`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP CONSTRAINT "FK_2a2cb10c27a1c71ab9700a83637"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP CONSTRAINT "FK_27fc2b39f4f76d45ca2cade5179"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "created_by_student" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."examination_request_status_enum"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request" ALTER COLUMN "chief_complaint" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ALTER COLUMN "request_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP COLUMN "symptoms"`);
        await queryRunner.query(`DROP TABLE "examination_appointments"`);
        await queryRunner.query(`DROP TYPE "public"."examination_appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" RENAME COLUMN "request_id" TO "examinationRequestId"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD CONSTRAINT "FK_7c608c681d15d8335292eb001f6" FOREIGN KEY ("examinationRequestId") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
