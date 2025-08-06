import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AgregandoColumnaIsEdited1754518896806 implements MigrationInterface {
    name = 'AgregandoColumnaIsEdited1754518896806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Si existiera la columna bannedUntil en user, la eliminamos
        const userTable = await queryRunner.getTable("user");
        if (userTable?.findColumnByName("bannedUntil")) {
            await queryRunner.query(`
                ALTER TABLE "user"
                DROP COLUMN "bannedUntil"
            `);
        }

        // 2) Si NO existe la columna isEdited en incident, la añadimos
        const incidentTable = await queryRunner.getTable("incident");
        if (!incidentTable?.findColumnByName("isEdited")) {
            await queryRunner.addColumn(
                "incident",
                new TableColumn({
                    name: "isEdited",
                    type: "boolean",
                    isNullable: false,
                    default: false,
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1) Si existe isEdited en incident, la eliminamos
        const incidentTable = await queryRunner.getTable("incident");
        if (incidentTable?.findColumnByName("isEdited")) {
            await queryRunner.query(`
                ALTER TABLE "incident"
                DROP COLUMN "isEdited"
            `);
        }

        // 2) Si NO existe bannedUntil en user, la volvemos a crear
        const userTable = await queryRunner.getTable("user");
        if (!userTable?.findColumnByName("bannedUntil")) {
            await queryRunner.query(`
                ALTER TABLE "user"
                ADD "bannedUntil" TIMESTAMP WITH TIME ZONE
            `);
        }
    }
}
