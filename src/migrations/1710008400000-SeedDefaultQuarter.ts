import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultQuarter1710008400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO quarter
        (id, name, address, location, phone, email, description)
      VALUES
        (
          1,
          'Cuartel Central',
          'Av. Siempre Viva 742, Ciudad Ejemplo',
          POINT(-34.6037, -58.3816),
          '+54 11 1234-5678',
          'cuartel.central@heroescercanos.org',
          'Cuartel principal del municipio más vulnerable'
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
