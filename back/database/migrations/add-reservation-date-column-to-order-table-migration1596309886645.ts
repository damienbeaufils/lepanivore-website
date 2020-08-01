import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReservationDateColumnToOrderTableMigration1596309886645 implements MigrationInterface {
  name: string = 'AddReservationDateColumnToOrderTableMigration1596309886645';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'reservation_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('order', 'reservation_date');
  }
}
