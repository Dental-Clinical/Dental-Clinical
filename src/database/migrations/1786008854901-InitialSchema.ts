import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786008854901 implements MigrationInterface {
    name = 'InitialSchema1786008854901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "FK_1ae5a59152a8696a18d93df94d2"`);
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "UQ_3d4f541f7213fba4a9fe760af04"`);
        await queryRunner.query(`ALTER TABLE "subjects" RENAME COLUMN "description" TO "short_name"`);
        await queryRunner.query(`ALTER TABLE "clinics" DROP COLUMN "academic_year_id"`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "UQ_79dd2d4fc95a707b7248ebbeadb" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "short_name"`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "short_name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "short_name"`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "short_name" text`);
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "UQ_79dd2d4fc95a707b7248ebbeadb"`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD "academic_year_id" integer`);
        await queryRunner.query(`ALTER TABLE "subjects" RENAME COLUMN "short_name" TO "description"`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "UQ_3d4f541f7213fba4a9fe760af04" UNIQUE ("name", "academic_year_id")`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "FK_1ae5a59152a8696a18d93df94d2" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
