import { MigrationInterface, QueryRunner } from "typeorm";

export class ModificandoUser1752097395352 implements MigrationInterface {
    name = 'ModificandoUser1752097395352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "googleId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "googleId" SET NOT NULL`);
    }

}
