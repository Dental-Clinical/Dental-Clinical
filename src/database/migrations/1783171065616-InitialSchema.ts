import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783171065616 implements MigrationInterface {
    name = 'InitialSchema1783171065616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" ADD CONSTRAINT "UQ_44b9727f5a8699d1ed15aa9bdc5" UNIQUE ("request_id", "tooth")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" DROP CONSTRAINT "UQ_44b9727f5a8699d1ed15aa9bdc5"`);
    }

}
