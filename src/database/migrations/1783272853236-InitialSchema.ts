import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783272853236 implements MigrationInterface {
    name = 'InitialSchema1783272853236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "academic_years" ("id" SERIAL NOT NULL, "label" character varying(255) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2021b90bfbfa6c9da7df34ca1cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "study_years" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "level" integer NOT NULL, CONSTRAINT "PK_f1984152192b72ce935ed4f28e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subjects" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "required_cases" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "study_year_id" integer, CONSTRAINT "UQ_8b1ea91f90f4e3e02a57f9faa64" UNIQUE ("study_year_id", "name"), CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clinical_cases_status_enum" AS ENUM('open', 'assigned', 'in_treatment', 'completed')`);
        await queryRunner.query(`CREATE TABLE "clinical_cases" ("id" SERIAL NOT NULL, "status" "public"."clinical_cases_status_enum" NOT NULL DEFAULT 'open', "closed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "patient_id" integer NOT NULL, "request_id" integer NOT NULL, "initial_examination_id" integer NOT NULL, "subject_id" integer NOT NULL, "assigned_student_id" integer, CONSTRAINT "REL_25c8aa111c0da38b8824f58b43" UNIQUE ("request_id"), CONSTRAINT "REL_4c3daa9b409009da9d73ada53a" UNIQUE ("initial_examination_id"), CONSTRAINT "PK_c5607a33859d602a59eab51a8a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."initial_examinations_status_enum" AS ENUM('in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "initial_examinations" ("id" SERIAL NOT NULL, "diagnosis" text NOT NULL, "clinicalFindings" text NOT NULL, "status" "public"."initial_examinations_status_enum" NOT NULL DEFAULT 'in_progress', "examined_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "request_id" integer, "appointment_id" integer, "coordinator_id" integer NOT NULL, "subject_id" integer NOT NULL, CONSTRAINT "REL_6b64c0753c7906d5b6e7624293" UNIQUE ("request_id"), CONSTRAINT "REL_b11a32e5ef0671b28d9f50fd88" UNIQUE ("appointment_id"), CONSTRAINT "PK_0183ba7fd52ea0fda3eee629324" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_7901f5a799644b99c4f533ddee3" FOREIGN KEY ("study_year_id") REFERENCES "study_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_802237763113b1591921aa02771" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_25c8aa111c0da38b8824f58b433" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae" FOREIGN KEY ("initial_examination_id") REFERENCES "initial_examinations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_126cfd25f276da233397e6c5a0e" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_30842ce0346d6ae3b057a8ce1f7" FOREIGN KEY ("assigned_student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_6b64c0753c7906d5b6e7624293f" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_b11a32e5ef0671b28d9f50fd88e" FOREIGN KEY ("appointment_id") REFERENCES "examination_appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_bd678b14263bc08fceed803eb63" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_a8c6be190522e7aaa1228332418" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_a8c6be190522e7aaa1228332418"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_bd678b14263bc08fceed803eb63"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_b11a32e5ef0671b28d9f50fd88e"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_6b64c0753c7906d5b6e7624293f"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_30842ce0346d6ae3b057a8ce1f7"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_126cfd25f276da233397e6c5a0e"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_25c8aa111c0da38b8824f58b433"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_802237763113b1591921aa02771"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_7901f5a799644b99c4f533ddee3"`);
        await queryRunner.query(`DROP TABLE "initial_examinations"`);
        await queryRunner.query(`DROP TYPE "public"."initial_examinations_status_enum"`);
        await queryRunner.query(`DROP TABLE "clinical_cases"`);
        await queryRunner.query(`DROP TYPE "public"."clinical_cases_status_enum"`);
        await queryRunner.query(`DROP TABLE "subjects"`);
        await queryRunner.query(`DROP TABLE "study_years"`);
        await queryRunner.query(`DROP TABLE "academic_years"`);
    }

}
