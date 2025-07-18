import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDonationColumn1752852909463 implements MigrationInterface {
    name = 'AddDonationColumn1752852909463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "donation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(12,2) NOT NULL, "description" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_25fb5a541964bc5cfc18fb13a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "donation" ADD CONSTRAINT "FK_063499388657e648418470a439a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donation" DROP CONSTRAINT "FK_063499388657e648418470a439a"`);
        await queryRunner.query(`DROP TABLE "donation"`);
    }

}
