import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785578293579 implements MigrationInterface {
  name = 'InitialSchema1785578293579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clinic_sections" DROP CONSTRAINT "FK_5592c7c93da81527d2b4a497fd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinic_sections" DROP COLUMN "subject_id"`,
    );
    await queryRunner.query(`ALTER TABLE "subjects" ADD "section_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "subjects" ADD CONSTRAINT "FK_1d7d88bc65f34e981d3bd0c4593" FOREIGN KEY ("section_id") REFERENCES "clinic_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subjects" DROP CONSTRAINT "FK_1d7d88bc65f34e981d3bd0c4593"`,
    );
    await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "section_id"`);
    await queryRunner.query(
      `ALTER TABLE "clinic_sections" ADD "subject_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "clinic_sections" ADD CONSTRAINT "FK_5592c7c93da81527d2b4a497fd8" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
