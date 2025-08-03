import { MigrationInterface, QueryRunner } from "typeorm";

export class BansEntity1754241641463 implements MigrationInterface {
    name = 'BansEntity1754241641463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Crear la tabla solo si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ban" (
              "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
              "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
              "manual" boolean NOT NULL DEFAULT false,
              "userId" uuid,
              CONSTRAINT "PK_071cddb7d5f18439fd992490618" PRIMARY KEY ("id")
            );
        `);

        // 2) Eliminar columnas antiguas solo si existen
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN IF EXISTS "banCount";
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN IF EXISTS "bannedUntil";
        `);

        // 3) Añadir la FK solo si no existe
        await queryRunner.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'FK_42b00b47164747240a163c318b7'
                  AND table_name = 'ban'
              ) THEN
                ALTER TABLE "ban"
                  ADD CONSTRAINT "FK_42b00b47164747240a163c318b7"
                    FOREIGN KEY ("userId") REFERENCES "user"("id")
                    ON DELETE NO ACTION ON UPDATE NO ACTION;
              END IF;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1) Eliminar la FK si existe
        await queryRunner.query(`
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE constraint_name = 'FK_42b00b47164747240a163c318b7'
                  AND table_name = 'ban'
              ) THEN
                ALTER TABLE "ban" DROP CONSTRAINT "FK_42b00b47164747240a163c318b7";
              END IF;
            END
            $$;
        `);

        // 2) Borrar la tabla solo si existe
        await queryRunner.query(`
            DROP TABLE IF EXISTS "ban";
        `);

        // 3) Volver a crear las columnas antiguas solo si no existen
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "bannedUntil" TIMESTAMP WITH TIME ZONE;
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "banCount" integer NOT NULL DEFAULT 0;
        `);
    }
}
