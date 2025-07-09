import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1752072062756 implements MigrationInterface {
    name = 'CreateUserTable1752072062756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "picture" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "googleid" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quarter" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "quarter" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quarter" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "quarter" ADD "description" text`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
