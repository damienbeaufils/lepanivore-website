import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterClosingPeriodTableToSetDatesOn10CharactersMigration1596316474648 implements MigrationInterface {
  name: string = 'AlterClosingPeriodTableToSetDatesOn10CharactersMigration1596316474648';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'closing_period',
      new TableColumn({
        name: 'new_start_date',
        type: 'varchar',
        length: '10',
        isNullable: false,
        default: "'UNKNOWN'",
      })
    );
    await queryRunner.addColumn(
      'closing_period',
      new TableColumn({
        name: 'new_end_date',
        type: 'varchar',
        length: '10',
        isNullable: false,
        default: "'UNKNOWN'",
      })
    );

    await queryRunner.query(`UPDATE "closing_period" SET new_start_date = substr(start_date, 1, 10)`);
    await queryRunner.query(`UPDATE "closing_period" SET new_end_date = substr(end_date, 1, 10)`);

    await queryRunner.dropColumn('closing_period', 'start_date');
    await queryRunner.dropColumn('closing_period', 'end_date');

    await queryRunner.renameColumn('closing_period', 'new_start_date', 'start_date');
    await queryRunner.renameColumn('closing_period', 'new_end_date', 'end_date');

    if (queryRunner.connection.options.type !== 'sqlite') {
      // DROP DEFAULT does not work on sqlite, so we have to keep this DEFAULT configuration when using sqlite, sadly
      await queryRunner.query('ALTER TABLE "closing_period" ALTER COLUMN "start_date" DROP DEFAULT');
      await queryRunner.query('ALTER TABLE "closing_period" ALTER COLUMN "end_date" DROP DEFAULT');
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('closing_period', 'start_date', 'new_start_date');
    await queryRunner.renameColumn('closing_period', 'end_date', 'new_end_date');

    await queryRunner.addColumn(
      'closing_period',
      new TableColumn({
        name: 'start_date',
        type: 'varchar',
        length: '24',
        isNullable: false,
        default: "'UNKNOWN'",
      })
    );
    await queryRunner.addColumn(
      'closing_period',
      new TableColumn({
        name: 'end_date',
        type: 'varchar',
        length: '24',
        isNullable: false,
        default: "'UNKNOWN'",
      })
    );

    await queryRunner.query(`UPDATE "closing_period" SET start_date = new_start_date || 'T12:00:00.000Z'`);
    await queryRunner.query(`UPDATE "closing_period" SET end_date = new_end_date || 'T12:00:00.000Z'`);

    await queryRunner.dropColumn('closing_period', 'new_start_date');
    await queryRunner.dropColumn('closing_period', 'new_end_date');

    if (queryRunner.connection.options.type !== 'sqlite') {
      // DROP DEFAULT does not work on sqlite, so we have to keep this DEFAULT configuration when using sqlite, sadly
      await queryRunner.query('ALTER TABLE "closing_period" ALTER COLUMN "start_date" DROP DEFAULT');
      await queryRunner.query('ALTER TABLE "closing_period" ALTER COLUMN "end_date" DROP DEFAULT');
    }
  }
}
