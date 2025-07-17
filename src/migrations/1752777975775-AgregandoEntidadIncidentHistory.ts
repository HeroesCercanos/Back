import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoEntidadIncidentHistory1752777975775 implements MigrationInterface {
    name = 'AgregandoEntidadIncidentHistory1752777975775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "incident_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "comment" character varying, "victimName" character varying, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "incidentId" uuid, CONSTRAINT "PK_a3c5e99493cd3a7310e0053951e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "incident_history" ADD CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident_history" DROP CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33"`);
        await queryRunner.query(`DROP TABLE "incident_history"`);
    }

}
