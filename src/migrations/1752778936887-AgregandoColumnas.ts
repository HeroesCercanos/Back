import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoColumnas1752778936887 implements MigrationInterface {
    name = 'AgregandoColumnas1752778936887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident_history" DROP CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33"`);
        await queryRunner.query(`ALTER TABLE "incident_history" ALTER COLUMN "incidentId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "incident_history" ADD CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident_history" DROP CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33"`);
        await queryRunner.query(`ALTER TABLE "incident_history" ALTER COLUMN "incidentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "incident_history" ADD CONSTRAINT "FK_67f3632b15d9fcc20de4ca22c33" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
