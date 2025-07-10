import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoCamposUser1752117750958 implements MigrationInterface {
    name = 'AgregandoCamposUser1752117750958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "latitude" numeric(9,6)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "longitude" numeric(9,6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "latitude"`);
    }

}
