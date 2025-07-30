import { MigrationInterface, QueryRunner } from "typeorm";

export class Entidademail1753911921562 implements MigrationInterface {
    name = 'Entidademail1753911921562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "subject" character varying NOT NULL, "htmlContent" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e832fef7d0d7dd4da2792eddbf7" UNIQUE ("name"), CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."scheduled_emails_frequency_enum" AS ENUM('daily', 'weekly', 'monthly', 'custom')`);
        await queryRunner.query(`CREATE TABLE "scheduled_emails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "frequency" "public"."scheduled_emails_frequency_enum" NOT NULL DEFAULT 'daily', "cronExpression" character varying, "enabled" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "templateId" uuid, CONSTRAINT "PK_9e519eae87bbd5a9e61b3e3193f" PRIMARY KEY ("id")); COMMENT ON COLUMN "scheduled_emails"."cronExpression" IS 'Cron expr if frequency=custom'`);
        await queryRunner.query(`ALTER TABLE "scheduled_emails" ADD CONSTRAINT "FK_4e7caf35177f4b756d76332e75a" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_emails" DROP CONSTRAINT "FK_4e7caf35177f4b756d76332e75a"`);
        await queryRunner.query(`DROP TABLE "scheduled_emails"`);
        await queryRunner.query(`DROP TYPE "public"."scheduled_emails_frequency_enum"`);
        await queryRunner.query(`DROP TABLE "email_templates"`);
    }

}
