import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailIndex1757672928659 implements MigrationInterface {
  name = 'AddUserEmailIndex1757672928659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a unique index on the email column of the "user" table
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USER_EMAIL" ON "user" ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: drop the index
    await queryRunner.query(`DROP INDEX "IDX_USER_EMAIL"`);
  }
}
