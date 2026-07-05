import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783160270420 implements MigrationInterface {
    name = 'InitialSchema1783160270420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "examination_request_attachments" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "file_path" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, CONSTRAINT "PK_d7128082679908a08de48accbd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "examination_request_teeth" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "tooth" integer NOT NULL, CONSTRAINT "PK_1417647f889c80d70e013d6f7ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."examination_appointments_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "examination_appointments" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "coordinator_id" integer, "status" "public"."examination_appointments_status_enum" NOT NULL, "appointment_date" date NOT NULL, "appointment_start" TIME NOT NULL, "appointment_end" TIME NOT NULL, CONSTRAINT "REL_3a1e57d4133f9f39b4ffd0afda" UNIQUE ("request_id"), CONSTRAINT "PK_f18833fe1fbd4d02d7e4389113d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."examination_request_status_enum" AS ENUM('pending', 'examined', 'rejected', 'converted_to_case')`);
        await queryRunner.query(`CREATE TABLE "examination_request" ("id" SERIAL NOT NULL, "patient_id" integer NOT NULL, "chief_complaint" character varying, "status" "public"."examination_request_status_enum" NOT NULL DEFAULT 'pending', "symptoms" character varying NOT NULL, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3341f7f1c6d72e6deb9bd6e450e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD CONSTRAINT "FK_27fc2b39f4f76d45ca2cade5179" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" ADD CONSTRAINT "FK_b36a8c366ad87a728458275b99b" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" ADD CONSTRAINT "FK_3a1e57d4133f9f39b4ffd0afda8" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" ADD CONSTRAINT "FK_24cd28b09c0455d11469f95b80d" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD CONSTRAINT "FK_3f2909b726751d3179411c008e9" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request" DROP CONSTRAINT "FK_3f2909b726751d3179411c008e9"`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" DROP CONSTRAINT "FK_24cd28b09c0455d11469f95b80d"`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" DROP CONSTRAINT "FK_3a1e57d4133f9f39b4ffd0afda8"`);
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" DROP CONSTRAINT "FK_b36a8c366ad87a728458275b99b"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP CONSTRAINT "FK_27fc2b39f4f76d45ca2cade5179"`);
        await queryRunner.query(`DROP TABLE "examination_request"`);
        await queryRunner.query(`DROP TYPE "public"."examination_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "examination_appointments"`);
        await queryRunner.query(`DROP TYPE "public"."examination_appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "examination_request_teeth"`);
        await queryRunner.query(`DROP TABLE "examination_request_attachments"`);
    }

}
