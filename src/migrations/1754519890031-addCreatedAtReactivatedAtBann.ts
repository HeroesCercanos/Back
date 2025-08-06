import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtReactivatedAtBann1754519890031 implements MigrationInterface {
    name = 'AddCreatedAtReactivatedAtBann1754519890031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ban" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "ban" ADD "reactivatedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ban" DROP COLUMN "reactivatedAt"`);
        await queryRunner.query(`ALTER TABLE "ban" DROP COLUMN "createdAt"`);
    }

}
