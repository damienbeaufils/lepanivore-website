import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterOrderTableToSetTypeOn12CharactersMigration1596315926678 implements MigrationInterface {
  name: string = 'AlterOrderTableToSetTypeOn12CharactersMigration1596315926678';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'new_type',
        type: 'varchar',
        length: '12',
        isNullable: false,
        default: "'UNKNOWN'",
      })
    );

    await queryRunner.query(`UPDATE "order" SET new_type = type`);

    await queryRunner.dropColumn('order', 'type');

    await queryRunner.renameColumn('order', 'new_type', 'type');

    if (queryRunner.connection.options.type !== 'sqlite') {
      // DROP DEFAULT does not work on sqlite, so we have to keep this DEFAULT configuration when using sqlite, sadly
      await queryRunner.query('ALTER TABLE "order" ALTER COLUMN "type" DROP DEFAULT');
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('order', 'type', 'new_type');

    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '8',
        isNullable: false,
        default: "'UNKNOWN'",
      })
    );

    await queryRunner.query(`UPDATE "order" SET type = new_type`);

    await queryRunner.dropColumn('order', 'new_type');

    if (queryRunner.connection.options.type !== 'sqlite') {
      // DROP DEFAULT does not work on sqlite, so we have to keep this DEFAULT configuration when using sqlite, sadly
      await queryRunner.query('ALTER TABLE "order" ALTER COLUMN "type" DROP DEFAULT');
    }
  }
}
