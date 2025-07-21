// src/migrations/1753049717174-arreglandoCampaigns.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertStatusEnumToBooleanIsActive1753049717174
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Solo si existe la columna 'status'
        if (await queryRunner.hasColumn("campaigns", "status")) {
            // 1) Quitar DEFAULT de status
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        ALTER COLUMN "status" DROP DEFAULT;
      `);

            // 2) Convertir status (enum) → boolean
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        ALTER COLUMN "status" TYPE boolean
        USING (
          CASE WHEN "status" = 'active' THEN true
               ELSE false
          END
        );
      `);

            // 3) Eliminar la columna isActive antigua, si existe
            if (await queryRunner.hasColumn("campaigns", "isActive")) {
                await queryRunner.query(`
          ALTER TABLE "campaigns"
          DROP COLUMN "isActive";
        `);
            }

            // 4) Renombrar status → isActive
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        RENAME COLUMN "status" TO "isActive";
      `);

            // 5) Restaurar DEFAULT true
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        ALTER COLUMN "isActive" SET DEFAULT true;
      `);

            // 6) Eliminar el tipo ENUM residual
            await queryRunner.query(`
        DROP TYPE IF EXISTS "public"."campaigns_status_enum";
      `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Para deshacer, solo si existe isActive
        if (await queryRunner.hasColumn("campaigns", "isActive")) {
            // 1) Recrear el enum
            await queryRunner.query(`
        CREATE TYPE "public"."campaigns_status_enum" AS ENUM('active','finalizada');
      `);

            // 2) Renombrar isActive → status
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        RENAME COLUMN "isActive" TO "status";
      `);

            // 3) Boolean → enum
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        ALTER COLUMN "status" TYPE "public"."campaigns_status_enum"
        USING (
          CASE WHEN "status" THEN 'active'::public."campaigns_status_enum"
               ELSE 'finalizada'::public."campaigns_status_enum"
          END
        );
      `);

            // 4) Restaurar DEFAULT 'active'
            await queryRunner.query(`
        ALTER TABLE "campaigns"
        ALTER COLUMN "status" SET DEFAULT 'active';
      `);
        }
    }
}
