import { MigrationInterface, QueryRunner } from "typeorm";

export class InitFullSchema1752858106196 implements MigrationInterface {
    name = 'InitFullSchema1752858106196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "incident_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "incidentId" uuid NOT NULL, "action" character varying NOT NULL, "comment" character varying, "victimName" character varying, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3c5e99493cd3a7310e0053951e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."incident_type_enum" AS ENUM('accidente', 'incendio')`);
        await queryRunner.query(`CREATE TYPE "public"."incident_status_enum" AS ENUM('activo', 'asistido', 'eliminado')`);
        await queryRunner.query(`CREATE TABLE "incident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."incident_type_enum" NOT NULL, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "description" character varying, "victimName" character varying, "reason" character varying, "adminComment" character varying, "status" "public"."incident_status_enum" NOT NULL DEFAULT 'activo', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_5f90b28b0b8238d89ee8edcf96e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "password" character varying, "picture" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "googleId" character varying, "phone" character varying, "address" character varying, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "latitude" numeric(9,6), "longitude" numeric(9,6), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quarter" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "location" point NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_253da18f42c0f18892c941cf0ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "donation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(12,2) NOT NULL, "description" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_25fb5a541964bc5cfc18fb13a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "incident_history" ADD CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incident" ADD CONSTRAINT "FK_c743cf0afa64e82b48fa7bf9f9b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "donation" ADD CONSTRAINT "FK_063499388657e648418470a439a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donation" DROP CONSTRAINT "FK_063499388657e648418470a439a"`);
        await queryRunner.query(`ALTER TABLE "incident" DROP CONSTRAINT "FK_c743cf0afa64e82b48fa7bf9f9b"`);
        await queryRunner.query(`ALTER TABLE "incident_history" DROP CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33"`);
        await queryRunner.query(`DROP TABLE "donation"`);
        await queryRunner.query(`DROP TABLE "quarter"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "incident"`);
        await queryRunner.query(`DROP TYPE "public"."incident_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."incident_type_enum"`);
        await queryRunner.query(`DROP TABLE "incident_history"`);
    }

}
