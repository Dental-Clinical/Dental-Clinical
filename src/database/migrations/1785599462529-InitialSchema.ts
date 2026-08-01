import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785599462529 implements MigrationInterface {
    name = 'InitialSchema1785599462529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diagnosis_images" DROP COLUMN "file_path"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_images" ADD "public_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "diagnosis_images" ADD "file_url" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diagnosis_images" DROP COLUMN "file_url"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_images" DROP COLUMN "public_id"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_images" ADD "file_path" character varying NOT NULL`);
    }

}
