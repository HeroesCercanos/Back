import { MigrationInterface, QueryRunner } from "typeorm";

export class BansEntity1754241641463 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 0) Asegurarnos de la extensión uuid-ossp (por si no la tienen):
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // 1) Si ya existe un tipo composite 'ban', lo eliminamos
    await queryRunner.query(`
      DROP TYPE IF EXISTS "ban" CASCADE;
    `);

    // 2) Si existiera la tabla (o un resto), la eliminamos
    await queryRunner.query(`
      DROP TABLE IF EXISTS "ban";
    `);

    // 3) Ahora sí creamos la tabla limpia
    await queryRunner.query(`
      CREATE TABLE "ban" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "manual" boolean NOT NULL DEFAULT false,
        "userId" uuid,
        CONSTRAINT "PK_071cddb7d5f18439fd992490618" PRIMARY KEY ("id")
      );
    `);

    // 4) Y la FK sólo si no existe
    await queryRunner.query(`
      ALTER TABLE "ban"
        ADD CONSTRAINT IF NOT EXISTS
          "FK_42b00b47164747240a163c318b7"
          FOREIGN KEY ("userId") REFERENCES "user"("id");
    `);

    // 5) Borramos las columnas viejas de User si existieran
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "banCount";
    `);
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "bannedUntil";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1) Quitamos la FK si existe
    await queryRunner.query(`
      ALTER TABLE "ban" DROP CONSTRAINT IF EXISTS "FK_42b00b47164747240a163c318b7";
    `);

    // 2) Borramos la tabla y el tipo
    await queryRunner.query(`
      DROP TABLE IF EXISTS "ban";
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "ban" CASCADE;
    `);

    // 3) Volvemos a recrear las columnas antiguas en user
    await queryRunner.query(`
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bannedUntil" TIMESTAMP WITH TIME ZONE;
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS "banCount" integer NOT NULL DEFAULT 0;
    `);
  }
}
