import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQuarterTable1710008200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'quarter',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'name', type: 'varchar' },
        { name: 'address', type: 'varchar' },
        { name: 'location', type: 'point' },
        { name: 'phone', type: 'varchar' },
        { name: 'email', type: 'varchar' },
        { name: 'description', type: 'text', isNullable: true },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quarter');
  }
}
