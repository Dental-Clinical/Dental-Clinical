import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782997677080 implements MigrationInterface {
    name = 'InitialSchema1782997677080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "university_id" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_e0208b4f964e609959aff431bf" UNIQUE ("userId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supervisors" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_bcb3cef71fd56c572bb7f59502" UNIQUE ("userId"), CONSTRAINT "PK_7c262062450a70e6f1b9f861232" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" SERIAL NOT NULL, "jti" character varying NOT NULL, "device_info" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_bd37bc320d2dc4a4cbbcd2993a1" UNIQUE ("jti"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "phone" character varying NOT NULL, "is_walkin" boolean NOT NULL DEFAULT false, "medical_history" text, "allergies" text, "current_medications" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_2c24c3490a26d04b0d70f92057" UNIQUE ("userId"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'patient', 'supervisor', 'student', 'coordinator')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "father_name" character varying NOT NULL, "phone" character varying, "email" character varying, "password_hash" character varying, "role" "public"."users_role_enum" NOT NULL, "profile_image" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coordinators" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_02690eedc405230d49520c0ce4" UNIQUE ("userId"), CONSTRAINT "PK_4f4d48f1f19c8f06b0bbcf395ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supervisors" ADD CONSTRAINT "FK_bcb3cef71fd56c572bb7f595024" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coordinators" ADD CONSTRAINT "FK_02690eedc405230d49520c0ce49" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coordinators" DROP CONSTRAINT "FK_02690eedc405230d49520c0ce49"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`);
        await queryRunner.query(`ALTER TABLE "supervisors" DROP CONSTRAINT "FK_bcb3cef71fd56c572bb7f595024"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`DROP TABLE "coordinators"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "supervisors"`);
        await queryRunner.query(`DROP TABLE "students"`);
    }

}
