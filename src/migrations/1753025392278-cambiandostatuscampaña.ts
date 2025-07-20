import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class Cambiandostatuscampaña1753025392278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Si no existe aún la columna 'status', la agregamos
    const hasStatus = await queryRunner.hasColumn("campaigns", "status");
    if (!hasStatus) {
      await queryRunner.addColumn(
        "campaigns",
        new TableColumn({
          name: "status",
          type: "enum",
          enum: ["active", "finalizada"],
          default: `'active'`,
        }),
      );
    }

    // 2) Sólo si existe 'isActive', copiamos sus valores y la borramos
    const hasIsActive = await queryRunner.hasColumn("campaigns", "isActive");
    if (hasIsActive) {
      // Copiar valores: true → active, false → finalizada
      await queryRunner.query(`
        UPDATE campaigns
           SET status = CASE WHEN "isActive" THEN 'active' ELSE 'finalizada' END
      `);
      // Luego la eliminamos
      await queryRunner.dropColumn("campaigns", "isActive");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Para revertir, si quieres volver a isActive:
    const hasStatus = await queryRunner.hasColumn("campaigns", "status");
    if (hasStatus) {
      await queryRunner.addColumn(
        "campaigns",
        new TableColumn({
          name: "isActive",
          type: "boolean",
          default: true,
        }),
      );
      await queryRunner.query(`
        UPDATE campaigns
           SET "isActive" = CASE WHEN status = 'active' THEN true ELSE false END
      `);
      await queryRunner.dropColumn("campaigns", "status");
    }
  }
}
