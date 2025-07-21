import { MigrationInterface, QueryRunner } from "typeorm";

export class CreandoEntidadCloudinary1753055290334 implements MigrationInterface {
    name = 'CreandoEntidadCloudinary1753055290334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "public_id" character varying NOT NULL, "secure_url" character varying NOT NULL, "resource_type" character varying NOT NULL, "format" character varying, "duration" integer, "caption" character varying, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "campaigns" ALTER COLUMN "isActive" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ALTER COLUMN "isActive" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "media"`);
    }

}
