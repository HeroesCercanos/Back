import { MigrationInterface, QueryRunner } from "typeorm";

export class Entidademail1753911921562 implements MigrationInterface {
    name = 'Entidademail1753911921562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla de plantillas de correo solo si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "email_templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "subject" character varying NOT NULL,
                "htmlContent" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e832fef7d0d7dd4da2792eddbf7" UNIQUE ("name"),
                CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id")
            );
        `);

        // Crear tipo ENUM para frecuencia solo si no existe
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_type WHERE typname = 'scheduled_emails_frequency_enum'
                ) THEN
                    CREATE TYPE "public"."scheduled_emails_frequency_enum" AS ENUM('daily','weekly','monthly','custom');
                END IF;
            END
            $$;
        `);

        // Crear tabla de correos programados solo si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "scheduled_emails" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "frequency" "public"."scheduled_emails_frequency_enum" NOT NULL DEFAULT 'daily',
                "cronExpression" character varying,
                "enabled" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "templateId" uuid,
                CONSTRAINT "PK_9e519eae87bbd5a9e61b3e3193f" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "scheduled_emails"."cronExpression" IS 'Cron expr if frequency=custom';
        `);

        // Agregar foreign key
        await queryRunner.query(`
            ALTER TABLE "scheduled_emails"
            ADD CONSTRAINT "FK_4e7caf35177f4b756d76332e75a"
            FOREIGN KEY ("templateId") REFERENCES "email_templates"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "scheduled_emails" DROP CONSTRAINT "FK_4e7caf35177f4b756d76332e75a";
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS "scheduled_emails";
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."scheduled_emails_frequency_enum";
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS "email_templates";
        `);
    }
}
