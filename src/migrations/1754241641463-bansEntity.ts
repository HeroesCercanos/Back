import { MigrationInterface, QueryRunner } from "typeorm";

export class BansEntity1754241641463 implements MigrationInterface {
    name = 'BansEntity1754241641463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ban" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "manual" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_071cddb7d5f18439fd992490618" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "banCount"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bannedUntil"`);
        await queryRunner.query(`ALTER TABLE "ban" ADD CONSTRAINT "FK_42b00b47164747240a163c318b7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ban" DROP CONSTRAINT "FK_42b00b47164747240a163c318b7"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bannedUntil" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user" ADD "banCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "ban"`);
    }

}
