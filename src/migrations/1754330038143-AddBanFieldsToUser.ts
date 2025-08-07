import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBanFieldsToUser1687654321000 implements MigrationInterface {
  name = "AddBanFieldsToUser1687654321000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'user'
        ) THEN
          -- ====== EJEMPLOS (descomentar/ajustar a tus campos reales) ======

          -- bannedUntil: TIMESTAMPTZ NULL
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='user' AND column_name='bannedUntil'
          ) THEN
            ALTER TABLE "user" ADD COLUMN "bannedUntil" TIMESTAMP WITH TIME ZONE;
          END IF;

          -- banReason: TEXT NULL
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='user' AND column_name='banReason'
          ) THEN
            ALTER TABLE "user" ADD COLUMN "banReason" text;
          END IF;

          -- lastBannedAt: TIMESTAMPTZ NULL
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='user' AND column_name='lastBannedAt'
          ) THEN
            ALTER TABLE "user" ADD COLUMN "lastBannedAt" TIMESTAMP WITH TIME ZONE;
          END IF;

          -- isBanned: boolean NOT NULL DEFAULT false
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='user' AND column_name='isBanned'
          ) THEN
            ALTER TABLE "user" ADD COLUMN "isBanned" boolean NOT NULL DEFAULT false;
          END IF;

          -- ================================================================
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Borrá solo las columnas que realmente agregaste
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='user' AND column_name='isBanned'
        ) THEN
          ALTER TABLE "user" DROP COLUMN "isBanned";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='user' AND column_name='lastBannedAt'
        ) THEN
          ALTER TABLE "user" DROP COLUMN "lastBannedAt";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='user' AND column_name='banReason'
        ) THEN
          ALTER TABLE "user" DROP COLUMN "banReason";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='user' AND column_name='bannedUntil'
        ) THEN
          ALTER TABLE "user" DROP COLUMN "bannedUntil";
        END IF;
      END
      $$;
    `);
  }
}
