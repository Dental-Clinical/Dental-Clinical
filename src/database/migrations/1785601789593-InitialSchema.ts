import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785601789593 implements MigrationInterface {
    name = 'InitialSchema1785601789593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clinical_case_media" ("id" SERIAL NOT NULL, "public_id" character varying NOT NULL, "file_url" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "clinical_case_id" integer NOT NULL, "uploaded_by_student_id" integer NOT NULL, CONSTRAINT "PK_c625c1d3985299296249e271cf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP COLUMN "file_path"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD "file_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD "public_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_case_media" ADD CONSTRAINT "FK_4404ada217674a5026c2565d54d" FOREIGN KEY ("clinical_case_id") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_case_media" ADD CONSTRAINT "FK_474f813685b14b953698161e88e" FOREIGN KEY ("uploaded_by_student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinical_case_media" DROP CONSTRAINT "FK_474f813685b14b953698161e88e"`);
        await queryRunner.query(`ALTER TABLE "clinical_case_media" DROP CONSTRAINT "FK_4404ada217674a5026c2565d54d"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP COLUMN "public_id"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP COLUMN "file_url"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD "file_path" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "clinical_case_media"`);
    }

}
