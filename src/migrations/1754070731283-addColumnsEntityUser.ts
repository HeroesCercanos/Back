// src/migrations/1754070731283-addColumnsEntityUser.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsEntityUser1754070731283 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='user' AND column_name='banCount'
        ) THEN
          ALTER TABLE "user" ADD "banCount" integer NOT NULL DEFAULT 0;
        END IF;
      END$$;
    `);
    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='user' AND column_name='bannedUntil'
        ) THEN
          ALTER TABLE "user" ADD "bannedUntil" TIMESTAMPTZ;
        END IF;
      END$$;
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "bannedUntil"`);
    await q.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "banCount"`);
  }
}
