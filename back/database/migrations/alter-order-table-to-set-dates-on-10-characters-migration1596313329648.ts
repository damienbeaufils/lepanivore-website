import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterOrderTableToSetDatesOn10CharactersMigration1596313329648 implements MigrationInterface {
  name: string = 'AlterOrderTableToSetDatesOn10CharactersMigration1596313329648';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'new_pick_up_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'new_delivery_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'new_reservation_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );

    await queryRunner.query(`UPDATE "order" SET new_pick_up_date = substr(pick_up_date, 1, 10) WHERE pick_up_date IS NOT NULL`);
    await queryRunner.query(`UPDATE "order" SET new_delivery_date = substr(delivery_date, 1, 10) WHERE delivery_date IS NOT NULL`);
    await queryRunner.query(`UPDATE "order" SET new_reservation_date = substr(reservation_date, 1, 10) WHERE reservation_date IS NOT NULL`);

    await queryRunner.dropColumn('order', 'pick_up_date');
    await queryRunner.dropColumn('order', 'delivery_date');
    await queryRunner.dropColumn('order', 'reservation_date');

    await queryRunner.renameColumn('order', 'new_pick_up_date', 'pick_up_date');
    await queryRunner.renameColumn('order', 'new_delivery_date', 'delivery_date');
    await queryRunner.renameColumn('order', 'new_reservation_date', 'reservation_date');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('order', 'pick_up_date', 'new_pick_up_date');
    await queryRunner.renameColumn('order', 'delivery_date', 'new_delivery_date');
    await queryRunner.renameColumn('order', 'reservation_date', 'new_reservation_date');

    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'pick_up_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'delivery_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'reservation_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );

    await queryRunner.query(`UPDATE "order" SET pick_up_date = new_pick_up_date || 'T12:00:00.000Z' WHERE new_pick_up_date IS NOT NULL`);
    await queryRunner.query(`UPDATE "order" SET delivery_date = new_delivery_date || 'T12:00:00.000Z' WHERE new_delivery_date IS NOT NULL`);
    await queryRunner.query(`UPDATE "order" SET reservation_date = new_reservation_date || 'T12:00:00.000Z' WHERE new_reservation_date IS NOT NULL`);

    await queryRunner.dropColumn('order', 'new_pick_up_date');
    await queryRunner.dropColumn('order', 'new_delivery_date');
    await queryRunner.dropColumn('order', 'new_reservation_date');
  }
}
