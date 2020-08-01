import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterOrderTableToSetDatesOn10CharactersMigration1596313329648 implements MigrationInterface {
  name: string = 'AlterOrderTableToSetDatesOn10CharactersMigration1596313329648';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE 'order' SET pick_up_date = substr(pick_up_date, 1, 10) WHERE pick_up_date IS NOT NULL`);
    await queryRunner.query(`UPDATE 'order' SET delivery_date = substr(delivery_date, 1, 10) WHERE delivery_date IS NOT NULL`);
    await queryRunner.query(`UPDATE 'order' SET reservation_date = substr(reservation_date, 1, 10) WHERE reservation_date IS NOT NULL`);
    await queryRunner.changeColumn(
      'order',
      'pick_up_date',
      new TableColumn({
        name: 'pick_up_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'order',
      'delivery_date',
      new TableColumn({
        name: 'delivery_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'order',
      'reservation_date',
      new TableColumn({
        name: 'reservation_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'order',
      'reservation_date',
      new TableColumn({
        name: 'reservation_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'order',
      'delivery_date',
      new TableColumn({
        name: 'delivery_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'order',
      'pick_up_date',
      new TableColumn({
        name: 'pick_up_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.query(`UPDATE 'order' SET reservation_date = reservation_date || 'T12:00:00.000Z' WHERE reservation_date IS NOT NULL`);
    await queryRunner.query(`UPDATE 'order' SET delivery_date = delivery_date || 'T12:00:00.000Z' WHERE delivery_date IS NOT NULL`);
    await queryRunner.query(`UPDATE 'order' SET pick_up_date = pick_up_date || 'T12:00:00.000Z' WHERE pick_up_date IS NOT NULL`);
  }
}
