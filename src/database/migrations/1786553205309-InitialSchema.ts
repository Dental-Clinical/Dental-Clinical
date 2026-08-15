import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1786553205309 implements MigrationInterface {
  name = 'InitialSchema1786553205309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "planned_procedures" DROP CONSTRAINT "FK_ad98aebd29c319f7d844c5c2691"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planned_procedures" ALTER COLUMN "clinical_case_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_7d9694c70852420e1d308f8c807"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initial_examinations" ALTER COLUMN "patient_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "planned_procedures" ADD CONSTRAINT "FK_ad98aebd29c319f7d844c5c2691" FOREIGN KEY ("clinical_case_id") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_7d9694c70852420e1d308f8c807" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "initial_examinations" DROP CONSTRAINT "FK_7d9694c70852420e1d308f8c807"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planned_procedures" DROP CONSTRAINT "FK_ad98aebd29c319f7d844c5c2691"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initial_examinations" ALTER COLUMN "patient_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "initial_examinations" ADD CONSTRAINT "FK_7d9694c70852420e1d308f8c807" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planned_procedures" ALTER COLUMN "clinical_case_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "planned_procedures" ADD CONSTRAINT "FK_ad98aebd29c319f7d844c5c2691" FOREIGN KEY ("clinical_case_id") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
