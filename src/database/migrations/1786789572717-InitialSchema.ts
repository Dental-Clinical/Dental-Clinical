import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786789572717 implements MigrationInterface {
    name = 'InitialSchema1786789572717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "section_subjects" DROP CONSTRAINT "FK_e67a352bd6dbd5286fd7f0bdaf7"`);
        await queryRunner.query(`ALTER TABLE "section_subjects" DROP CONSTRAINT "FK_1f69c663f25d0b5043f2bc8d692"`);
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "FK_1ae5a59152a8696a18d93df94d2"`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_question_options" ("id" SERIAL NOT NULL, "label" character varying(255) NOT NULL, "value" character varying(100) NOT NULL, "displayOrder" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "question_id" integer NOT NULL, CONSTRAINT "PK_a096fed389af4c224b8f8a4b742" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_answers" ("id" SERIAL NOT NULL, "answer" text, "diagnosis_submission_id" integer NOT NULL, "planned_procedure_id" integer NOT NULL, "question_id" integer NOT NULL, CONSTRAINT "UQ_cab9c3dd1d582290cf35f5bff07" UNIQUE ("planned_procedure_id", "question_id"), CONSTRAINT "PK_984c4276f4194ee7efe594ecbf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subject_diagnosis_questions_type_enum" AS ENUM('text', 'textarea', 'number', 'boolean', 'single-choice', 'multiple-choice')`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_questions" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "type" "public"."subject_diagnosis_questions_type_enum" NOT NULL, "required" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "subject_id" integer, CONSTRAINT "UQ_47d117ed802269acbcfd8327243" UNIQUE ("subject_id", "question"), CONSTRAINT "PK_e8847be7843b5599e97e75c470a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."device_tokens_platform_enum" AS ENUM('android', 'web', 'ios')`);
        await queryRunner.query(`CREATE TABLE "device_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "platform" "public"."device_tokens_platform_enum" NOT NULL, "user_id" integer NOT NULL, "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_977e24c520c49436d08e5eeea8a" UNIQUE ("token"), CONSTRAINT "PK_84700be257607cfb1f9dc2e52c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_17e1f528b993c6d55def4cf5be" ON "device_tokens"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_answer_selected_options" ("answer_id" integer NOT NULL, "option_id" integer NOT NULL, CONSTRAINT "PK_1b7f23900b8ed253036e43e3f3a" PRIMARY KEY ("answer_id", "option_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b44fa26318b20e8cea0adecae" ON "subject_diagnosis_answer_selected_options"  ("answer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_053c9539185c8752f7bed3931a" ON "subject_diagnosis_answer_selected_options"  ("option_id") `);
        await queryRunner.query(`ALTER TABLE "clinics" DROP COLUMN "academic_year_id"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" DROP COLUMN "clinical_impression"`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" ADD "supervisor_viewed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "short_name" character varying`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "requires_dental_chart" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ALTER COLUMN "tooth_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_25c8aa111c0da38b8824f58b433"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "request_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "initial_examination_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "section_subjects" ADD CONSTRAINT "FK_e67a352bd6dbd5286fd7f0bdaf7" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section_subjects" ADD CONSTRAINT "FK_1f69c663f25d0b5043f2bc8d692" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_question_options" ADD CONSTRAINT "FK_121436139007608ac5e9262f765" FOREIGN KEY ("question_id") REFERENCES "subject_diagnosis_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_af00346d9677ae8735c42733c0f" FOREIGN KEY ("diagnosis_submission_id") REFERENCES "diagnosis_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_284a6e06af582999e8176a57e27" FOREIGN KEY ("planned_procedure_id") REFERENCES "planned_procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_898e42936d90a4d621260578cc1" FOREIGN KEY ("question_id") REFERENCES "subject_diagnosis_questions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" ADD CONSTRAINT "FK_6289ecbf3c8e56ca7c8550544f0" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_25c8aa111c0da38b8824f58b433" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae" FOREIGN KEY ("initial_examination_id") REFERENCES "initial_examinations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device_tokens" ADD CONSTRAINT "FK_17e1f528b993c6d55def4cf5bea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" ADD CONSTRAINT "FK_9b44fa26318b20e8cea0adecae1" FOREIGN KEY ("answer_id") REFERENCES "subject_diagnosis_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" ADD CONSTRAINT "FK_053c9539185c8752f7bed3931a5" FOREIGN KEY ("option_id") REFERENCES "subject_diagnosis_question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" DROP CONSTRAINT "FK_053c9539185c8752f7bed3931a5"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" DROP CONSTRAINT "FK_9b44fa26318b20e8cea0adecae1"`);
        await queryRunner.query(`ALTER TABLE "device_tokens" DROP CONSTRAINT "FK_17e1f528b993c6d55def4cf5bea"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" DROP CONSTRAINT "FK_25c8aa111c0da38b8824f58b433"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" DROP CONSTRAINT "FK_6289ecbf3c8e56ca7c8550544f0"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_898e42936d90a4d621260578cc1"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_284a6e06af582999e8176a57e27"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_af00346d9677ae8735c42733c0f"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_question_options" DROP CONSTRAINT "FK_121436139007608ac5e9262f765"`);
        await queryRunner.query(`ALTER TABLE "section_subjects" DROP CONSTRAINT "FK_1f69c663f25d0b5043f2bc8d692"`);
        await queryRunner.query(`ALTER TABLE "section_subjects" DROP CONSTRAINT "FK_e67a352bd6dbd5286fd7f0bdaf7"`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "initial_examination_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ALTER COLUMN "request_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_4c3daa9b409009da9d73ada53ae" FOREIGN KEY ("initial_examination_id") REFERENCES "initial_examinations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_cases" ADD CONSTRAINT "FK_25c8aa111c0da38b8824f58b433" FOREIGN KEY ("request_id") REFERENCES "examination_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" ALTER COLUMN "tooth_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "planned_procedures" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "requires_dental_chart"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "short_name"`);
        await queryRunner.query(`ALTER TABLE "treatment_sessions" DROP COLUMN "supervisor_viewed_at"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ADD "clinical_impression" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD "academic_year_id" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_053c9539185c8752f7bed3931a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b44fa26318b20e8cea0adecae"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_answer_selected_options"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17e1f528b993c6d55def4cf5be"`);
        await queryRunner.query(`DROP TABLE "device_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."device_tokens_platform_enum"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_questions"`);
        await queryRunner.query(`DROP TYPE "public"."subject_diagnosis_questions_type_enum"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_answers"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_question_options"`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "FK_1ae5a59152a8696a18d93df94d2" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section_subjects" ADD CONSTRAINT "FK_1f69c663f25d0b5043f2bc8d692" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section_subjects" ADD CONSTRAINT "FK_e67a352bd6dbd5286fd7f0bdaf7" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
