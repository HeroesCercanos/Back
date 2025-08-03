import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBanCountToUser1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "banCount" integer NOT NULL DEFAULT 0;
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN IF EXISTS "banCount";
    `);
  }
}
