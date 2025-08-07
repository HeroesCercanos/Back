import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBanCountToUser1680000000000 implements MigrationInterface {
  name = "AddBanCountToUser1680000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Si la tabla "user" existe...
        IF EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name   = 'user'
        ) THEN
          -- ...y la columna no existe, la agregamos
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name   = 'user'
              AND column_name  = 'banCount'
          ) THEN
            ALTER TABLE "user"
            ADD COLUMN "banCount" integer NOT NULL DEFAULT 0;
          END IF;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name   = 'user'
            AND column_name  = 'banCount'
        ) THEN
          ALTER TABLE "user" DROP COLUMN "banCount";
        END IF;
      END
      $$;
    `);
  }
}
