import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterClosingPeriodTableToSetDatesOn10CharactersMigration1596316474648 implements MigrationInterface {
  name: string = 'AlterClosingPeriodTableToSetDatesOn10CharactersMigration1596316474648';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "closing_period" SET start_date = substr(start_date, 1, 10)`);
    await queryRunner.query(`UPDATE "closing_period" SET end_date = substr(end_date, 1, 10)`);
    await queryRunner.changeColumn(
      'closing_period',
      'start_date',
      new TableColumn({
        name: 'start_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'closing_period',
      'end_date',
      new TableColumn({
        name: 'end_date',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'closing_period',
      'end_date',
      new TableColumn({
        name: 'end_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'closing_period',
      'start_date',
      new TableColumn({
        name: 'start_date',
        type: 'varchar',
        length: '24',
        isNullable: true,
      })
    );
    await queryRunner.query(`UPDATE "closing_period" SET end_date = end_date || 'T12:00:00.000Z'`);
    await queryRunner.query(`UPDATE "closing_period" SET start_date = start_date || 'T12:00:00.000Z'`);
  }
}
