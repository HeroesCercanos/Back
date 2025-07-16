import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoColumnasPhoneYAddress1752698354664 implements MigrationInterface {
    name = 'AgregandoColumnasPhoneYAddress1752698354664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
    }

}
