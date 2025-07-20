import { MigrationInterface, QueryRunner } from "typeorm";

export class Mail1752987175830 implements MigrationInterface {
    name = 'Mail1752987175830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "isActive"`);
    }

}
