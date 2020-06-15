import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AddForeignKeyTransactionCategory1589925368092
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transacitions_category',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'transactions',
      'fk_transacitions_category',
    );
  }
}
