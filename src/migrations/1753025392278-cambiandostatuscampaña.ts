import { MigrationInterface, QueryRunner } from "typeorm";

export class Cambiandostatuscampaña1753025392278 implements MigrationInterface {
    name = 'Cambiandostatuscampaña1753025392278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" RENAME COLUMN "isActive" TO "status"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."campaigns_status_enum" AS ENUM('active', 'finalizada')`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "status" "public"."campaigns_status_enum" NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."campaigns_status_enum"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "status" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "campaigns" RENAME COLUMN "status" TO "isActive"`);
    }

}
