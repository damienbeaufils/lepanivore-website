import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OrderNotFoundError } from '../../src/domain/order/errors/order-not-found.error';
import { OrderType } from '../../src/domain/order/order-type';
import { OrderInterface } from '../../src/domain/order/order.interface';
import { OrderId } from '../../src/domain/type-aliases';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { DatabaseOrderRepository } from '../../src/infrastructure/repositories/database-order.repository';
import { OrderEntity } from '../../src/infrastructure/repositories/entities/order.entity';
import { RepositoriesModule } from '../../src/infrastructure/repositories/repositories.module';
import { e2eEnvironmentConfigService } from '../e2e-config';
import { runDatabaseMigrations } from './database-e2e.utils';

describe('infrastructure/repositories/DatabaseOrderRepository', () => {
  let app: INestApplication;
  let databaseOrderRepository: DatabaseOrderRepository;
  let orderEntityRepository: Repository<OrderEntity>;
  let orderWithoutId: OrderInterface;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RepositoriesModule],
    })
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await runDatabaseMigrations(app.get(EnvironmentConfigService));

    databaseOrderRepository = app.get(DatabaseOrderRepository);
    // @ts-ignore
    orderEntityRepository = databaseOrderRepository.orderEntityRepository;
  });

  beforeEach(async () => {
    await orderEntityRepository.clear();

    orderWithoutId = {
      clientName: 'John Doe',
      clientPhoneNumber: '+1 514 111 1111',
      clientEmailAddress: 'test@example.org',
      products: [
        { product: { id: 1, name: 'product 1', description: 'product 1 description', price: 1.11 }, quantity: 1 },
        { product: { id: 2, name: 'product 2', description: 'product 2 description', price: 2.22 }, quantity: 2 },
      ],
      type: OrderType.PICK_UP,
      pickUpDate: new Date('2020-06-13T12:00:00Z'),
      deliveryAddress: 'Montréal',
    } as OrderInterface;
  });

  describe('save()', () => {
    it('should persist order in database', async () => {
      // when
      await databaseOrderRepository.save(orderWithoutId);

      // then
      const count: number = await orderEntityRepository.count();
      expect(count).toBe(1);
    });

    it('should return saved order with an id', async () => {
      // when
      const result: OrderId = await databaseOrderRepository.save(orderWithoutId);

      // then
      expect(result).toBeDefined();
    });
  });

  describe('delete()', () => {
    it('should delete existing order in database', async () => {
      // given
      const savedOrderId: OrderId = await databaseOrderRepository.save(orderWithoutId);
      const savedOrder: OrderInterface = await databaseOrderRepository.findById(savedOrderId);

      // when
      await databaseOrderRepository.delete(savedOrder);

      // then
      const count: number = await orderEntityRepository.count();
      expect(count).toBe(0);
    });
  });

  describe('findById()', () => {
    it('should return found order in database', async () => {
      // given
      await databaseOrderRepository.save(orderWithoutId);
      const orderWithoutIdAndDifferentClientName: OrderInterface = { ...orderWithoutId, clientName: 'Harry Potter' };
      const savedOrderIdDifferentClientName: OrderId = await databaseOrderRepository.save(orderWithoutIdAndDifferentClientName);

      // when
      const result: OrderInterface = await databaseOrderRepository.findById(savedOrderIdDifferentClientName);

      // then
      expect(result.id).toBe(savedOrderIdDifferentClientName);
      expect(result).toMatchObject(orderWithoutIdAndDifferentClientName);
    });

    it('should throw exception when order not found in database', async () => {
      // given
      const randomId: OrderId = Math.floor(Math.random() * 1000 + 1000);

      // when
      const result: Promise<OrderInterface> = databaseOrderRepository.findById(randomId);

      // then
      await expect(result).rejects.toThrow(new OrderNotFoundError(`Order not found with id "${randomId}"`));
    });
  });

  describe('findAll()', () => {
    it('should return found orders in database', async () => {
      // given
      await databaseOrderRepository.save(orderWithoutId);
      const orderWithoutIdAndDifferentClientName: OrderInterface = { ...orderWithoutId, clientName: 'Harry Potter' };
      await databaseOrderRepository.save(orderWithoutIdAndDifferentClientName);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAll();

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutId);
      expect(result[1]).toMatchObject(orderWithoutIdAndDifferentClientName);
    });

    it('should return empty array when no order has been found in database', async () => {
      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAll();

      // then
      expect(result).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
