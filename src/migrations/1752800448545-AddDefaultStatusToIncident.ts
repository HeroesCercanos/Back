import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultStatusToIncident1752800448545 implements MigrationInterface {
    name = 'AddDefaultStatusToIncident1752800448545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."incident_status_enum" RENAME TO "incident_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."incident_status_enum" AS ENUM('activo', 'asistido', 'eliminado')`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" TYPE "public"."incident_status_enum" USING "status"::"text"::"public"."incident_status_enum"`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" SET DEFAULT 'activo'`);
        await queryRunner.query(`DROP TYPE "public"."incident_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" SET DEFAULT 'activo'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."incident_status_enum_old" AS ENUM('asistido', 'eliminado')`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "incident" ALTER COLUMN "status" TYPE "public"."incident_status_enum_old" USING "status"::"text"::"public"."incident_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."incident_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."incident_status_enum_old" RENAME TO "incident_status_enum"`);
    }

}
