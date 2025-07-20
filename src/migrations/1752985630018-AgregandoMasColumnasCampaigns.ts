import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoMasColumnasCampaigns1752985630018 implements MigrationInterface {
    name = 'AgregandoMasColumnasCampaigns1752985630018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id")`);
    }

}
