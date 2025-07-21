// src/migrations/1753025392278-cambiandostatuscampaña.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class Cambiandostatuscampaña1753025392278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Creo el tipo ENUM
    await queryRunner.query(`
      CREATE TYPE "public"."campaigns_status_enum" AS ENUM('active', 'finalizada')
    `);

    // 2) Agrego la columna status con valor por defecto
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD "status" "public"."campaigns_status_enum" NOT NULL DEFAULT 'active'
    `);

    // 3) Actualizo las filas existentes casteando cada literal al ENUM
    await queryRunner.query(`
      UPDATE "campaigns"
      SET "status" = CASE
        WHEN "isActive" THEN 'active'::public.campaigns_status_enum
        ELSE 'finalizada'::public.campaigns_status_enum
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Deshago los cambios
    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN "status"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."campaigns_status_enum"
    `);
  }
}
