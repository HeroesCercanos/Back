import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveUser1753558659576 implements MigrationInterface {
    name = 'AddIsActiveUser1753558659576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
    }

}
