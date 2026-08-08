import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786221548798 implements MigrationInterface {
    name = 'InitialSchema1786221548798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."subject_diagnosis_questions_type_enum" RENAME TO "subject_diagnosis_questions_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."subject_diagnosis_questions_type_enum" AS ENUM('text', 'textarea', 'number', 'boolean', 'single-choice', 'multiple-choice')`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" ALTER COLUMN "type" TYPE "public"."subject_diagnosis_questions_type_enum" USING "type"::"text"::"public"."subject_diagnosis_questions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subject_diagnosis_questions_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subject_diagnosis_questions_type_enum_old" AS ENUM('0', '1', '2', '3', '4', '5')`);
        await queryRunner.query(`ALTER TABLE "subject_diagnosis_questions" ALTER COLUMN "type" TYPE "public"."subject_diagnosis_questions_type_enum_old" USING "type"::"text"::"public"."subject_diagnosis_questions_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."subject_diagnosis_questions_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."subject_diagnosis_questions_type_enum_old" RENAME TO "subject_diagnosis_questions_type_enum"`);
    }

}
