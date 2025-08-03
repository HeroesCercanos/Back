import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailCampaigns1754183474177 implements MigrationInterface {
    name = 'CreateEmailCampaigns1754183474177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_campaigns" ("id" SERIAL NOT NULL, "subject" character varying NOT NULL, "templateName" character varying NOT NULL, "variables" text NOT NULL, "status" character varying NOT NULL, "scheduledAt" TIMESTAMP, "recipients" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_72bad329795785308e66d562350" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetTokenExpires"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetTokenExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetTokenExpires"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetTokenExpires" bigint`);
        await queryRunner.query(`DROP TABLE "email_campaigns"`);
    }

}
