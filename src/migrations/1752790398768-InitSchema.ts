import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1752790398768 implements MigrationInterface {
    name = 'InitSchema1752790398768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "incident_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "incidentId" uuid NOT NULL, "action" character varying NOT NULL, "comment" character varying, "victimName" character varying, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3c5e99493cd3a7310e0053951e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "incident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."incident_type_enum" NOT NULL, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "description" character varying, "victimName" character varying, "reason" character varying, "adminComment" character varying, "status" "public"."incident_status_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_5f90b28b0b8238d89ee8edcf96e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "incident_history" ADD CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incident" ADD CONSTRAINT "FK_c743cf0afa64e82b48fa7bf9f9b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident" DROP CONSTRAINT "FK_c743cf0afa64e82b48fa7bf9f9b"`);
        await queryRunner.query(`ALTER TABLE "incident_history" DROP CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33"`);
        await queryRunner.query(`DROP TABLE "incident"`);
        await queryRunner.query(`DROP TABLE "incident_history"`);
    }

}
