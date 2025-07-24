import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsUser1753381970011 implements MigrationInterface {
    name = 'AddColumnsUser1753381970011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "resetToken" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetTokenExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetTokenExpires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetToken"`);
    }

}
