import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786220552796 implements MigrationInterface {
    name = 'InitialSchema1786220552796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_answer_options" ("id" SERIAL NOT NULL, "label" character varying NOT NULL, "value" character varying NOT NULL, "displayOrder" integer NOT NULL, "question_id" integer, CONSTRAINT "PK_8b6ea4efb12bfd033eaaab46ceb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subject_diagnosis_questions_type_enum" AS ENUM('0', '1', '2', '3', '4', '5')`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_questions" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "type" "public"."subject_diagnosis_questions_type_enum" NOT NULL, "required" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "subject_id" integer, CONSTRAINT "PK_e8847be7843b5599e97e75c470a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subject_diagnosis_answers" ("id" SERIAL NOT NULL, "answer" text NOT NULL, "diagnosisSubmissionId" integer, "questionId" integer, CONSTRAINT "PK_984c4276f4194ee7efe594ecbf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_options" ADD CONSTRAINT "FK_8c92fe59a084d5ed9f121300605" FOREIGN KEY ("question_id") REFERENCES "subject_diagnosis_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" ADD CONSTRAINT "FK_6289ecbf3c8e56ca7c8550544f0" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_f66322ce95ca251bef6f4d7380c" FOREIGN KEY ("diagnosisSubmissionId") REFERENCES "diagnosis_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" ADD CONSTRAINT "FK_fe0a5caa81fe5eed16442739229" FOREIGN KEY ("questionId") REFERENCES "subject_diagnosis_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_fe0a5caa81fe5eed16442739229"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answers" DROP CONSTRAINT "FK_f66322ce95ca251bef6f4d7380c"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" DROP CONSTRAINT "FK_6289ecbf3c8e56ca7c8550544f0"`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_answer_options" DROP CONSTRAINT "FK_8c92fe59a084d5ed9f121300605"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_answers"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_questions"`);
        await queryRunner.query(`DROP TYPE "public"."subject_diagnosis_questions_type_enum"`);
        await queryRunner.query(`DROP TABLE "subject_diagnosis_answer_options"`);
    }

}
