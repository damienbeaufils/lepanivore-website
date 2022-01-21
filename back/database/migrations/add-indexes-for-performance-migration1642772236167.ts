import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexesForPerformanceMigration1642772236167 implements MigrationInterface {
  name: string = 'AddIndexesForPerformanceMigration1642772236167';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'product',
      new TableIndex({
        name: 'idx_product_status',
        columnNames: ['status'],
        isUnique: false,
      })
    );

    await queryRunner.createIndex(
      'feature',
      new TableIndex({
        name: 'idx_feature_name',
        columnNames: ['name'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'idx_order_pick_up_date',
        columnNames: ['pick_up_date'],
        isUnique: false,
      })
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'idx_order_delivery_date',
        columnNames: ['delivery_date'],
        isUnique: false,
      })
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'idx_order_reservation_date',
        columnNames: ['reservation_date'],
        isUnique: false,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('order', 'idx_order_reservation_date');
    await queryRunner.dropIndex('order', 'idx_order_delivery_date');
    await queryRunner.dropIndex('order', 'idx_order_pick_up_date');
    await queryRunner.dropIndex('feature', 'idx_feature_name');
    await queryRunner.dropIndex('product', 'idx_product_status');
  }
}
