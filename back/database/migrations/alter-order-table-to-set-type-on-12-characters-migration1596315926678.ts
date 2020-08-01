import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterOrderTableToSetTypeOn12CharactersMigration1596315926678 implements MigrationInterface {
  name: string = 'AlterOrderTableToSetTypeOn12CharactersMigration1596315926678';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'order',
      'type',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '12',
        isNullable: false,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'order',
      'type',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '8',
        isNullable: false,
      })
    );
  }
}
