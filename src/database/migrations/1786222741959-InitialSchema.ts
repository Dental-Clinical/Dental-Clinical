import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786222741959 implements MigrationInterface {
    name = 'InitialSchema1786222741959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" ADD CONSTRAINT "UQ_47d117ed802269acbcfd8327243" UNIQUE ("subject_id", "question")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" DROP CONSTRAINT "UQ_47d117ed802269acbcfd8327243"`);
    }

}
