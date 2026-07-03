import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783087345553 implements MigrationInterface {
    name = 'InitialSchema1783087345553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" RENAME COLUMN "examination_request_id" TO "examinationRequestId"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD "created_by_student" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ALTER COLUMN "examinationRequestId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD CONSTRAINT "FK_7c608c681d15d8335292eb001f6" FOREIGN KEY ("examinationRequestId") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP CONSTRAINT "FK_7c608c681d15d8335292eb001f6"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ALTER COLUMN "examinationRequestId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP COLUMN "created_by_student"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" RENAME COLUMN "examinationRequestId" TO "examination_request_id"`);
    }

}
