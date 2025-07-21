// src/migrations/1753055290334-creandoEntidadCloudinary.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreandoEntidadCloudinary1753055290334 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Si existía un tipo “media” (resto de un intento previo), lo eliminamos
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."media" CASCADE;
    `);

    // 2) Si existía la tabla media, la eliminamos
    await queryRunner.query(`
      DROP TABLE IF EXISTS "media";
    `);

    // 3) Creamos la tabla limpia
    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "public_id" character varying NOT NULL,
        "secure_url" character varying NOT NULL,
        "resource_type" character varying NOT NULL,
        "format" character varying,
        "duration" integer,
        "caption" character varying,
        CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Para revertir, eliminamos la tabla y el tipo compuesto
    await queryRunner.query(`
      DROP TABLE IF EXISTS "media";
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."media" CASCADE;
    `);
  }
}
