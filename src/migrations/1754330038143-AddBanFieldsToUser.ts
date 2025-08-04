import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBanFieldsToUser1687654321000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "banCount" integer NOT NULL DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "bannedUntil" TIMESTAMP WITH TIME ZONE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "bannedUntil";
    `);
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "banCount";
    `);
  }
}