import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertStatusEnumToBooleanIsActive1753049717174
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Quitar DEFAULT del enum status (si existe)
        await queryRunner.query(`
      ALTER TABLE "campaigns"
      ALTER COLUMN "status" DROP DEFAULT;
    `);

        // 2) Transformar status(enum) → boolean preservando valores
        await queryRunner.query(`
      ALTER TABLE "campaigns"
      ALTER COLUMN "status" TYPE boolean
      USING (
        CASE
          WHEN "status" = 'active' THEN true
          ELSE false
        END
      );
    `);

        // 3) Renombrar la columna a isActive
        await queryRunner.query(`
      ALTER TABLE "campaigns"
      RENAME COLUMN "status" TO "isActive";
    `);

        // 4) Eliminar el tipo enum que ya no se usa
        await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."campaigns_status_enum";
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1) Recrear el tipo enum
        await queryRunner.query(`
      CREATE TYPE "public"."campaigns_status_enum" AS ENUM('active','finalizada');
    `);

        // 2) Renombrar isActive → status
        await queryRunner.query(`
      ALTER TABLE "campaigns"
      RENAME COLUMN "isActive" TO "status";
    `);

        // 3) Transformar boolean → enum preservando valores
        await queryRunner.query(`
      ALTER TABLE "campaigns"
      ALTER COLUMN "status" TYPE "public"."campaigns_status_enum"
      USING (
        CASE
          WHEN "status" THEN 'active'::public."campaigns_status_enum"
          ELSE 'finalizada'::public."campaigns_status_enum"
        END
      );
    `);

        // 4) Restaurar el DEFAULT del enum
        await queryRunner.query(`
      ALTER TABLE "campaigns"
      ALTER COLUMN "status" SET DEFAULT 'active';
    `);
    }
}
