import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785570930870 implements MigrationInterface {
  name = 'InitialSchema1785570930870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."clinical_case_evaluations_grade_enum" AS ENUM('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F')`,
    );
    await queryRunner.query(
      `CREATE TABLE "clinical_case_evaluations" ("id" SERIAL NOT NULL, "grade" "public"."clinical_case_evaluations_grade_enum" NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "clinical_case_id" integer NOT NULL, "student_id" integer NOT NULL, "supervisor_id" integer NOT NULL, CONSTRAINT "REL_124aec5598dcb9da70da554ceb" UNIQUE ("clinical_case_id"), CONSTRAINT "PK_70cd8b9ae1cee9d9f5ddf469924" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_subject_procedure_progress" ("id" SERIAL NOT NULL, "completed_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "student_id" integer NOT NULL, "subject_procedure_id" integer NOT NULL, CONSTRAINT "UQ_6fb1dd8eb8c774cbc23a6db3b56" UNIQUE ("student_id", "subject_procedure_id"), CONSTRAINT "PK_39520c4eb1eb6f9af175e4ee17f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_case_evaluations" ADD CONSTRAINT "FK_124aec5598dcb9da70da554cebf" FOREIGN KEY ("clinical_case_id") REFERENCES "clinical_cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_case_evaluations" ADD CONSTRAINT "FK_3e73d2dc7bd8749f85e094b838e" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_case_evaluations" ADD CONSTRAINT "FK_674790dded07f595db1854b5b0d" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_subject_procedure_progress" ADD CONSTRAINT "FK_d02d4f74f7c3778f77fb9e1f168" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_subject_procedure_progress" ADD CONSTRAINT "FK_5519e0e90023329ef0a9a87f0b9" FOREIGN KEY ("subject_procedure_id") REFERENCES "subject_procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student_subject_procedure_progress" DROP CONSTRAINT "FK_5519e0e90023329ef0a9a87f0b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_subject_procedure_progress" DROP CONSTRAINT "FK_d02d4f74f7c3778f77fb9e1f168"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_case_evaluations" DROP CONSTRAINT "FK_674790dded07f595db1854b5b0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_case_evaluations" DROP CONSTRAINT "FK_3e73d2dc7bd8749f85e094b838e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinical_case_evaluations" DROP CONSTRAINT "FK_124aec5598dcb9da70da554cebf"`,
    );
    await queryRunner.query(`DROP TABLE "student_subject_procedure_progress"`);
    await queryRunner.query(`DROP TABLE "clinical_case_evaluations"`);
    await queryRunner.query(
      `DROP TYPE "public"."clinical_case_evaluations_grade_enum"`,
    );
  }
}
