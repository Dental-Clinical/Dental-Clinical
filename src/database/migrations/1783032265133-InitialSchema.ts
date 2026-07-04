import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783032265133 implements MigrationInterface {
    name = 'InitialSchema1783032265133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "examination_request_attachments" ("id" SERIAL NOT NULL, "examination_request_id" integer NOT NULL, "file_path" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, CONSTRAINT "PK_d7128082679908a08de48accbd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "examination_request" ("id" SERIAL NOT NULL, "patientId" integer NOT NULL, "chief_complaint" character varying NOT NULL, "status" character varying NOT NULL, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3341f7f1c6d72e6deb9bd6e450e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "examination_request_teeth" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "tooth" integer NOT NULL, CONSTRAINT "PK_1417647f889c80d70e013d6f7ef" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "examination_request_teeth"`);
        await queryRunner.query(`DROP TABLE "examination_request"`);
        await queryRunner.query(`DROP TABLE "examination_request_attachments"`);
    }

}
