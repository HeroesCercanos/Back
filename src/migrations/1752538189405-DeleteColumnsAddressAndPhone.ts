import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePhoneAndAddressFromUser1752539999999  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'phone');
    await queryRunner.dropColumn('user', 'address');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "address" character varying`);
  }
}
