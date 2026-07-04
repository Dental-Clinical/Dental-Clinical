import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783091296214 implements MigrationInterface {
    name = 'InitialSchema1783091296214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request" DROP CONSTRAINT "FK_2a2cb10c27a1c71ab9700a83637"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD "patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD CONSTRAINT "FK_3f2909b726751d3179411c008e9" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request" DROP CONSTRAINT "FK_3f2909b726751d3179411c008e9"`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP COLUMN "patient_id"`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD CONSTRAINT "FK_2a2cb10c27a1c71ab9700a83637" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
