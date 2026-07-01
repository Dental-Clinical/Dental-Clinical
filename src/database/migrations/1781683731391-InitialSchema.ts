import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781683731391 implements MigrationInterface {
    name = 'InitialSchema1781683731391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "university_id" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_e0208b4f964e609959aff431bf" UNIQUE ("userId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supervisors" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_bcb3cef71fd56c572bb7f59502" UNIQUE ("userId"), CONSTRAINT "PK_7c262062450a70e6f1b9f861232" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coordinators" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_02690eedc405230d49520c0ce4" UNIQUE ("userId"), CONSTRAINT "PK_4f4d48f1f19c8f06b0bbcf395ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supervisors" ADD CONSTRAINT "FK_bcb3cef71fd56c572bb7f595024" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coordinators" ADD CONSTRAINT "FK_02690eedc405230d49520c0ce49" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coordinators" DROP CONSTRAINT "FK_02690eedc405230d49520c0ce49"`);
        await queryRunner.query(`ALTER TABLE "supervisors" DROP CONSTRAINT "FK_bcb3cef71fd56c572bb7f595024"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "coordinators"`);
        await queryRunner.query(`DROP TABLE "supervisors"`);
        await queryRunner.query(`DROP TABLE "students"`);
    }

}
