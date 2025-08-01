import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsEntityUser1754070731283 implements MigrationInterface {
    name = 'AddColumnsEntityUser1754070731283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE "user"
            ADD "banCount" integer NOT NULL DEFAULT 0
        `);
        await queryRunner.query(`
          ALTER TABLE "user"
            ADD "bannedUntil" TIMESTAMP WITH TIME ZONE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bannedUntil"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "banCount"`);
    }
}
