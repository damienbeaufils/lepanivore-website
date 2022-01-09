import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCheckedColumnToOrderTableMigration1641758684816 implements MigrationInterface {
  name: string = 'AddCheckedColumnToOrderTableMigration1641758684816';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'checked',
        type: 'boolean',
        isNullable: true,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('order', 'checked');
  }
}
