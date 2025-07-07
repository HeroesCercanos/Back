// src/migrations/1710020000000-UpdateQuarterData.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuarterData1710020000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE quarter
      SET
        name        = 'Cuartel Monte Caseros',
        address     = 'Colón N° 643',
        location    = POINT(-30.249865048616716, -57.63056297116415),
        phone       = '+543775422207',
        email       = 'bomberosvoluntarioamontecaseros@hotmail.com.ar',
        description = 'Bomberos Voluntarios de Monte Caseros'
      WHERE id = 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE quarter
      SET
        name        = 'Cuartel Central',
        address     = 'Av. Siempre Viva 742, Ciudad Ejemplo',
        location    = POINT(-34.6037, -58.3816),
        phone       = '+54 11 1234-5678',
        email       = 'cuartel.central@heroescercanos.org',
        description = 'Cuartel principal del municipio más vulnerable'
      WHERE id = 1;
    `);
  }
}
