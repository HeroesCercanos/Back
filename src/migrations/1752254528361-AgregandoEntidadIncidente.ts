import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoEntidadIncidente1752254528361 implements MigrationInterface {
    name = 'AgregandoEntidadIncidente1752254528361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."incidents_incidenttype_enum" AS ENUM('incendio', 'accidente')`);
        await queryRunner.query(`CREATE TYPE "public"."incidents_action_enum" AS ENUM('asistido', 'eliminado')`);
        await queryRunner.query(`CREATE TABLE "incidents" ("id" SERIAL NOT NULL, "incidentType" "public"."incidents_incidenttype_enum" NOT NULL DEFAULT 'accidente', "latitude" numeric(9,6) NOT NULL, "longitude" numeric(9,6) NOT NULL, "locationDetail" character varying, "commentaries" character varying, "reporterId" uuid NOT NULL, "adminId" uuid, "action" "public"."incidents_action_enum", "adminCommentary" character varying, CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_eb4eedb4f8cf4e58b66857067f9" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_ef83257b6bd72b318c702c845c7" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_ef83257b6bd72b318c702c845c7"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_eb4eedb4f8cf4e58b66857067f9"`);
        await queryRunner.query(`DROP TABLE "incidents"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_incidenttype_enum"`);
    }

}
