import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783277791646 implements MigrationInterface {
    name = 'InitialSchema1783277791646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "academic_years" ("id" SERIAL NOT NULL, "label" character varying(255) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2021b90bfbfa6c9da7df34ca1cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "coordinator_schedules_day_of_week_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`);
        await queryRunner.query(`CREATE TABLE "coordinator_schedules" ("id" SERIAL NOT NULL, "day_of_week" "coordinator_schedules_day_of_week_enum" NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "slot_duration" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "coordinator_id" integer, CONSTRAINT "UQ_6703ffb128516d160e6ccc0df6c" UNIQUE ("coordinator_id", "day_of_week"), CONSTRAINT "PK_d3515501e198f923c6ae937247f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "university_id" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_e0208b4f964e609959aff431bf" UNIQUE ("userId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supervisors" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_bcb3cef71fd56c572bb7f59502" UNIQUE ("userId"), CONSTRAINT "PK_7c262062450a70e6f1b9f861232" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" SERIAL NOT NULL, "jti" character varying NOT NULL, "device_info" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_bd37bc320d2dc4a4cbbcd2993a1" UNIQUE ("jti"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "examination_request_attachments" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "file_path" character varying NOT NULL, "file_name" character varying NOT NULL, "mime_type" character varying NOT NULL, CONSTRAINT "PK_d7128082679908a08de48accbd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "examination_request_teeth" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "tooth" integer NOT NULL, CONSTRAINT "UQ_44b9727f5a8699d1ed15aa9bdc5" UNIQUE ("request_id", "tooth"), CONSTRAINT "PK_1417647f889c80d70e013d6f7ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "examination_appointments_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "examination_appointments" ("id" SERIAL NOT NULL, "request_id" integer NOT NULL, "coordinator_id" integer, "status" "examination_appointments_status_enum" NOT NULL, "appointment_date" date NOT NULL, "appointment_start" TIME NOT NULL, "appointment_end" TIME NOT NULL, CONSTRAINT "REL_3a1e57d4133f9f39b4ffd0afda" UNIQUE ("request_id"), CONSTRAINT "PK_f18833fe1fbd4d02d7e4389113d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "examination_request_status_enum" AS ENUM('pending', 'examined', 'rejected', 'converted_to_case')`);
        await queryRunner.query(`CREATE TABLE "examination_request" ("id" SERIAL NOT NULL, "patient_id" integer NOT NULL, "chief_complaint" character varying, "status" "examination_request_status_enum" NOT NULL DEFAULT 'pending', "symptoms" character varying NOT NULL, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3341f7f1c6d72e6deb9bd6e450e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "phone" character varying NOT NULL, "is_walkin" boolean NOT NULL DEFAULT false, "medical_history" text, "allergies" text, "current_medications" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_2c24c3490a26d04b0d70f92057" UNIQUE ("userId"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('admin', 'patient', 'supervisor', 'student', 'coordinator')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "father_name" character varying NOT NULL, "phone" character varying, "email" character varying, "password_hash" character varying, "role" "users_role_enum" NOT NULL, "profile_image" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coordinators" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_02690eedc405230d49520c0ce4" UNIQUE ("userId"), CONSTRAINT "PK_4f4d48f1f19c8f06b0bbcf395ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "study_years" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "level" integer NOT NULL, CONSTRAINT "PK_f1984152192b72ce935ed4f28e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subjects" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "required_cases" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "study_year_id" integer, CONSTRAINT "UQ_8b1ea91f90f4e3e02a57f9faa64" UNIQUE ("study_year_id", "name"), CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "initial_examinations_status_enum" AS ENUM('in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "initial_examinations" ("id" SERIAL NOT NULL, "diagnosis" text NOT NULL, "clinicalFindings" text NOT NULL, "status" "initial_examinations_status_enum" NOT NULL DEFAULT 'in_progress', "examined_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "request_id" integer, "appointment_id" integer, "coordinator_id" integer NOT NULL, "subject_id" integer NOT NULL, CONSTRAINT "UQ_6b64c0753c7906d5b6e7624293f" UNIQUE ("request_id"), CONSTRAINT "REL_6b64c0753c7906d5b6e7624293" UNIQUE ("request_id"), CONSTRAINT "REL_b11a32e5ef0671b28d9f50fd88" UNIQUE ("appointment_id"), CONSTRAINT "PK_0183ba7fd52ea0fda3eee629324" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "clinical_cases_status_enum" AS ENUM('open', 'assigned', 'in_treatment', 'completed')`);
        await queryRunner.query(`CREATE TABLE "clinical_cases" ("id" SERIAL NOT NULL, "status" "clinical_cases_status_enum" NOT NULL DEFAULT 'open', "closed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "patient_id" integer NOT NULL, "request_id" integer NOT NULL, "initial_examination_id" integer NOT NULL, "subject_id" integer NOT NULL, "assigned_student_id" integer, CONSTRAINT "REL_25c8aa111c0da38b8824f58b43" UNIQUE ("request_id"), CONSTRAINT "REL_4c3daa9b409009da9d73ada53a" UNIQUE ("initial_examination_id"), CONSTRAINT "PK_c5607a33859d602a59eab51a8a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "coordinator_schedules" ADD CONSTRAINT "FK_08935b3c9b231dcd47f8f52156d" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supervisors" ADD CONSTRAINT "FK_bcb3cef71fd56c572bb7f595024" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" ADD CONSTRAINT "FK_27fc2b39f4f76d45ca2cade5179" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" ADD CONSTRAINT "FK_b36a8c366ad87a728458275b99b" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" ADD CONSTRAINT "FK_3a1e57d4133f9f39b4ffd0afda8" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" ADD CONSTRAINT "FK_24cd28b09c0455d11469f95b80d" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "examination_request" ADD CONSTRAINT "FK_3f2909b726751d3179411c008e9" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coordinators" ADD CONSTRAINT "FK_02690eedc405230d49520c0ce49" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_7901f5a799644b99c4f533ddee3" FOREIGN KEY ("study_year_id") REFERENCES "study_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_6b64c0753c7906d5b6e7624293f" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_b11a32e5ef0671b28d9f50fd88e" FOREIGN KEY ("appointment_id") REFERENCES "examination_appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_bd678b14263bc08fceed803eb63" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_a8c6be190522e7aaa1228332418" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_802237763113b1591921aa02771" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_25c8aa111c0da38b8824f58b433" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae" FOREIGN KEY ("initial_examination_id") REFERENCES "initial_examinations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_126cfd25f276da233397e6c5a0e" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_30842ce0346d6ae3b057a8ce1f7" FOREIGN KEY ("assigned_student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_30842ce0346d6ae3b057a8ce1f7"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_126cfd25f276da233397e6c5a0e"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_25c8aa111c0da38b8824f58b433"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_802237763113b1591921aa02771"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_a8c6be190522e7aaa1228332418"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_bd678b14263bc08fceed803eb63"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_b11a32e5ef0671b28d9f50fd88e"`);
        await queryRunner.query(`ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_6b64c0753c7906d5b6e7624293f"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_7901f5a799644b99c4f533ddee3"`);
        await queryRunner.query(`ALTER TABLE "coordinators" DROP CONSTRAINT "FK_02690eedc405230d49520c0ce49"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "examination_request" DROP CONSTRAINT "FK_3f2909b726751d3179411c008e9"`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" DROP CONSTRAINT "FK_24cd28b09c0455d11469f95b80d"`);
        await queryRunner.query(`ALTER TABLE "examination_appointments" DROP CONSTRAINT "FK_3a1e57d4133f9f39b4ffd0afda8"`);
        await queryRunner.query(`ALTER TABLE "examination_request_teeth" DROP CONSTRAINT "FK_b36a8c366ad87a728458275b99b"`);
        await queryRunner.query(`ALTER TABLE "examination_request_attachments" DROP CONSTRAINT "FK_27fc2b39f4f76d45ca2cade5179"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`);
        await queryRunner.query(`ALTER TABLE "supervisors" DROP CONSTRAINT "FK_bcb3cef71fd56c572bb7f595024"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "coordinator_schedules" DROP CONSTRAINT "FK_08935b3c9b231dcd47f8f52156d"`);
        await queryRunner.query(`DROP TABLE "clinical_cases"`);
        await queryRunner.query(`DROP TYPE "clinical_cases_status_enum"`);
        await queryRunner.query(`DROP TABLE "initial_examinations"`);
        await queryRunner.query(`DROP TYPE "initial_examinations_status_enum"`);
        await queryRunner.query(`DROP TABLE "subjects"`);
        await queryRunner.query(`DROP TABLE "study_years"`);
        await queryRunner.query(`DROP TABLE "coordinators"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_role_enum"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TABLE "examination_request"`);
        await queryRunner.query(`DROP TYPE "examination_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "examination_appointments"`);
        await queryRunner.query(`DROP TYPE "examination_appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "examination_request_teeth"`);
        await queryRunner.query(`DROP TABLE "examination_request_attachments"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "supervisors"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "coordinator_schedules"`);
        await queryRunner.query(`DROP TYPE "coordinator_schedules_day_of_week_enum"`);
        await queryRunner.query(`DROP TABLE "academic_years"`);
    }

}
