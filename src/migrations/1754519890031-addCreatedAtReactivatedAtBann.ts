import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtReactivatedAtBann1754519890031 implements MigrationInterface {
    name = 'AddCreatedAtReactivatedAtBann1754519890031';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Agregar createdAt si no existe
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'ban'
                      AND column_name = 'createdAt'
                ) THEN
                    ALTER TABLE "ban"
                    ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
                END IF;

                -- Agregar reactivatedAt si no existe
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'ban'
                      AND column_name = 'reactivatedAt'
                ) THEN
                    ALTER TABLE "ban"
                    ADD "reactivatedAt" TIMESTAMP WITH TIME ZONE;
                END IF;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Eliminar reactivatedAt si existe
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'ban'
                      AND column_name = 'reactivatedAt'
                ) THEN
                    ALTER TABLE "ban" DROP COLUMN "reactivatedAt";
                END IF;

                -- Eliminar createdAt si existe
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'ban'
                      AND column_name = 'createdAt'
                ) THEN
                    ALTER TABLE "ban" DROP COLUMN "createdAt";
                END IF;
            END
            $$;
        `);
    }
}
