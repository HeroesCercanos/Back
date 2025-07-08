import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultQuarter1710008400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO quarter
        (id, name, address, location, phone, email, description)
      VALUES
        (
          1,
          'Cuartel Monte Caseros',
          'Colón N° 643',
          POINT(-30.249865048616716, -57.63056297116415),
          '+543775422207',
          'bomberosvoluntarioamontecaseros@hotmail.com.ar',
          'Bomberos Voluntarios de Monte Caseros'
        )
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM quarter
      WHERE id = 1;
    `);
  }
}
