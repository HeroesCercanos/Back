import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoColumnasAIncident1752720407275 implements MigrationInterface {
    name = 'AgregandoColumnasAIncident1752720407275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."incident_type_enum" AS ENUM('accidente', 'incendio')`);
        await queryRunner.query(`CREATE TYPE "public"."incident_status_enum" AS ENUM('asistido', 'eliminado')`);
        await queryRunner.query(`CREATE TABLE "incident" ("id" SERIAL NOT NULL, "type" "public"."incident_type_enum" NOT NULL, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "description" character varying, "victimName" character varying, "reason" character varying, "adminComment" character varying, "status" "public"."incident_status_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_5f90b28b0b8238d89ee8edcf96e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "incident" ADD CONSTRAINT "FK_c743cf0afa64e82b48fa7bf9f9b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident" DROP CONSTRAINT "FK_c743cf0afa64e82b48fa7bf9f9b"`);
        await queryRunner.query(`DROP TABLE "incident"`);
        await queryRunner.query(`DROP TYPE "public"."incident_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."incident_type_enum"`);
    }

}
