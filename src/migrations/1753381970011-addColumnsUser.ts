// src/migrations/1753381970011-addColumnsUser.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsUser1753381970011 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'user'
            AND column_name = 'resetToken'
        ) THEN
          ALTER TABLE "user" ADD COLUMN "resetToken" text;
        END IF;
      END$$;
    `);

        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'user'
            AND column_name = 'resetTokenExpires'
        ) THEN
          ALTER TABLE "user" ADD COLUMN "resetTokenExpires" bigint;
        END IF;
      END$$;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // opcionalmente podés dejar DROP IF EXISTS aquí
        await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "resetToken";
    `);
        await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "resetTokenExpires";
    `);
    }
}
