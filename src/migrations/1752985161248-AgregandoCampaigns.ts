import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoCampaigns1752985161248 implements MigrationInterface {
    name = 'AgregandoCampaigns1752985161248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "campaigns" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "description" text, "startDate" date NOT NULL, "endDate" date NOT NULL, CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "campaigns"`);
    }

}
