import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783520736325 implements MigrationInterface {
    name = 'InitialSchema1783520736325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."supervisor_schedules_day_of_week_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`);
        await queryRunner.query(`CREATE TABLE "supervisor_schedules" ("id" SERIAL NOT NULL, "day_of_week" "public"."supervisor_schedules_day_of_week_enum" NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "slot_duration" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "supervisor_id" integer, CONSTRAINT "UQ_ad67dc4a0c1e5bb435a54e76296" UNIQUE ("supervisor_id", "day_of_week"), CONSTRAINT "PK_b52ea3233a72bc7d5a2e36d4e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clinical_appointments_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "clinical_appointments" ("id" SERIAL NOT NULL, "appointmentDate" date NOT NULL, "appointmentStart" TIME NOT NULL, "appointmentEnd" TIME NOT NULL, "status" "public"."clinical_appointments_status_enum" NOT NULL, "clinicalCaseId" integer, "studentId" integer, "patientId" integer, "supervisorId" integer, CONSTRAINT "PK_780a989f8e1c0987a3691175eaf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "supervisor_schedules" ADD CONSTRAINT "FK_660b0780a545dd22e5940e274b9" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" ADD CONSTRAINT "FK_3600ef5b97990268b28cf070921" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" ADD CONSTRAINT "FK_2d63505445d93b761f8573a0c48" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" ADD CONSTRAINT "FK_c745f27b7c89906590aa3916664" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" ADD CONSTRAINT "FK_6a6e9e95d65c90aeb7198ea854a" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinical_appointments" DROP CONSTRAINT "FK_6a6e9e95d65c90aeb7198ea854a"`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" DROP CONSTRAINT "FK_c745f27b7c89906590aa3916664"`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" DROP CONSTRAINT "FK_2d63505445d93b761f8573a0c48"`);
        await queryRunner.query(`ALTER TABLE "clinical_appointments" DROP CONSTRAINT "FK_3600ef5b97990268b28cf070921"`);
        await queryRunner.query(`ALTER TABLE "supervisor_schedules" DROP CONSTRAINT "FK_660b0780a545dd22e5940e274b9"`);
        await queryRunner.query(`DROP TABLE "clinical_appointments"`);
        await queryRunner.query(`DROP TYPE "public"."clinical_appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "supervisor_schedules"`);
        await queryRunner.query(`DROP TYPE "public"."supervisor_schedules_day_of_week_enum"`);
    }

}
