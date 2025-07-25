import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoColumnasDonation1753467760652 implements MigrationInterface {
    name = 'AgregandoColumnasDonation1753467760652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."donation_status_enum" AS ENUM('pending', 'completed')`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "status" "public"."donation_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "preferenceId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "preferenceId"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."donation_status_enum"`);
    }

}
