import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786479462698 implements MigrationInterface {
    name = 'InitialSchema1786479462698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "UQ_c1c0b9c1b2dccabc6acc75a2577"`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" ADD "supervisor_viewed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD "planned_procedure_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "requires_dental_chart" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ALTER COLUMN "tooth_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_25c8aa111c0da38b8824f58b433"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "request_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "initial_examination_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "UQ_cab9c3dd1d582290cf35f5bff07" UNIQUE ("planned_procedure_id", "question_id")`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_284a6e06af582999e8176a57e27" FOREIGN KEY ("planned_procedure_id") REFERENCES "planned_procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_25c8aa111c0da38b8824f58b433" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae" FOREIGN KEY ("initial_examination_id") REFERENCES "initial_examinations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_25c8aa111c0da38b8824f58b433"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_284a6e06af582999e8176a57e27"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "UQ_cab9c3dd1d582290cf35f5bff07"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "initial_examination_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "request_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae" FOREIGN KEY ("initial_examination_id") REFERENCES "initial_examinations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_25c8aa111c0da38b8824f58b433" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ALTER COLUMN "tooth_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "requires_dental_chart"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP COLUMN "planned_procedure_id"`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" DROP COLUMN "supervisor_viewed_at"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "UQ_c1c0b9c1b2dccabc6acc75a2577" UNIQUE ("diagnosis_submission_id", "question_id")`);
    }

}
