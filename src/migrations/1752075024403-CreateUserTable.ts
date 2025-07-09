import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1752075024403 implements MigrationInterface {
    name = 'CreateUserTable1752075024403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "googleid" TO "googleId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "googleId" TO "googleid"`);
    }

}
