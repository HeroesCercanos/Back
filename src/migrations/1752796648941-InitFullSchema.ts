import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitFullSchema1752796648941 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ... otras DDL

    // Reemplaza el CREATE TYPE directo por un bloque que compruebe existencia:
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'incident_type_enum'
        ) THEN
          CREATE TYPE "public"."incident_type_enum" AS ENUM('accidente','incendio');
        END IF;
      END$$;
    `);

    // ... resto de la migración
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // si quieres, aquí también podrías DROP TYPE IF EXISTS
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."incident_type_enum";
    `);

    // ... resto del down()
  }
}
