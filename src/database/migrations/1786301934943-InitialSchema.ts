import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786301934943 implements MigrationInterface {
    name = 'InitialSchema1786301934943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_question_options" ("id" SERIAL NOT NULL, "label" character varying(255) NOT NULL, "value" character varying(100) NOT NULL, "displayOrder" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "question_id" integer NOT NULL, CONSTRAINT "PK_a096fed389af4c224b8f8a4b742" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_answers" ("id" SERIAL NOT NULL, "answer" text, "diagnosis_submission_id" integer NOT NULL, "question_id" integer NOT NULL, CONSTRAINT "UQ_c1c0b9c1b2dccabc6acc75a2577" UNIQUE ("diagnosis_submission_id", "question_id"), CONSTRAINT "PK_984c4276f4194ee7efe594ecbf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subject_diagnosis_questions_type_enum" AS ENUM('text', 'textarea', 'number', 'boolean', 'single-choice', 'multiple-choice')`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_questions" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "type" "public"."subject_diagnosis_questions_type_enum" NOT NULL, "required" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "subject_id" integer, CONSTRAINT "UQ_47d117ed802269acbcfd8327243" UNIQUE ("subject_id", "question"), CONSTRAINT "PK_e8847be7843b5599e97e75c470a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_answer_selected_options" ("answer_id" integer NOT NULL, "option_id" integer NOT NULL, CONSTRAINT "PK_1b7f23900b8ed253036e43e3f3a" PRIMARY KEY ("answer_id", "option_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b44fa26318b20e8cea0adecae" ON "subject_diagnosis_answer_selected_options"  ("answer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_053c9539185c8752f7bed3931a" ON "subject_diagnosis_answer_selected_options"  ("option_id") `);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" DROP COLUMN "clinical_impression"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_question_options" ADD CONSTRAINT "FK_121436139007608ac5e9262f765" FOREIGN KEY ("question_id") REFERENCES "subject_diagnosis_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_af00346d9677ae8735c42733c0f" FOREIGN KEY ("diagnosis_submission_id") REFERENCES "diagnosis_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_898e42936d90a4d621260578cc1" FOREIGN KEY ("question_id") REFERENCES "subject_diagnosis_questions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" ADD CONSTRAINT "FK_6289ecbf3c8e56ca7c8550544f0" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" ADD CONSTRAINT "FK_9b44fa26318b20e8cea0adecae1" FOREIGN KEY ("answer_id") REFERENCES "subject_diagnosis_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" ADD CONSTRAINT "FK_053c9539185c8752f7bed3931a5" FOREIGN KEY ("option_id") REFERENCES "subject_diagnosis_question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" DROP CONSTRAINT "FK_053c9539185c8752f7bed3931a5"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_selected_options" DROP CONSTRAINT "FK_9b44fa26318b20e8cea0adecae1"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" DROP CONSTRAINT "FK_6289ecbf3c8e56ca7c8550544f0"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_898e42936d90a4d621260578cc1"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_af00346d9677ae8735c42733c0f"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_question_options" DROP CONSTRAINT "FK_121436139007608ac5e9262f765"`);
        await queryRunner.query(`ALTER TABLE "diagnosis_submissions" ADD "clinical_impression" text NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_053c9539185c8752f7bed3931a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b44fa26318b20e8cea0adecae"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_answer_selected_options"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_questions"`);
        await queryRunner.query(`DROP TYPE "public"."subject_diagnosis_questions_type_enum"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_answers"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_question_options"`);
    }

}
