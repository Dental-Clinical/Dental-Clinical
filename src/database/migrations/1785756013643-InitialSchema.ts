import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785756013643 implements MigrationInterface {
    name = 'InitialSchema1785756013643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "profilePictureUrl" text`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "profilePicturePublicId" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "profilePicturePublicId"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "profilePictureUrl"`);
    }

}
