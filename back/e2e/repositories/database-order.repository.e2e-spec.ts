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

  describe('findAllByYear()', () => {
    it('should return found orders in database where pick-up date has same year as given', async () => {
      // given
      const year: number = 2021;
      const orderWithoutIdAndPickUpDateYearMinusOne: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndPickUpDateFirstOfYear: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2021-01-01T12:00:00Z') };
      const orderWithoutIdAndPickUpDateLastOfYear: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2021-12-31T12:00:00Z') };
      const orderWithoutIdAndPickUpDateYearPlusOne: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2022-01-01T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndPickUpDateYearMinusOne);
      await databaseOrderRepository.save(orderWithoutIdAndPickUpDateFirstOfYear);
      await databaseOrderRepository.save(orderWithoutIdAndPickUpDateLastOfYear);
      await databaseOrderRepository.save(orderWithoutIdAndPickUpDateYearPlusOne);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByYear(year);

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutIdAndPickUpDateFirstOfYear);
      expect(result[1]).toMatchObject(orderWithoutIdAndPickUpDateLastOfYear);
    });

    it('should return found orders in database where delivery date has same year as given', async () => {
      // given
      const year: number = 2021;
      const orderWithoutIdAndDeliveryDateYearMinusOne: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndDeliveryDateFirstOfYear: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2021-01-01T12:00:00Z') };
      const orderWithoutIdAndDeliveryDateLastOfYear: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2021-12-31T12:00:00Z') };
      const orderWithoutIdAndDeliveryDateYearPlusOne: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2022-01-01T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndDeliveryDateYearMinusOne);
      await databaseOrderRepository.save(orderWithoutIdAndDeliveryDateFirstOfYear);
      await databaseOrderRepository.save(orderWithoutIdAndDeliveryDateLastOfYear);
      await databaseOrderRepository.save(orderWithoutIdAndDeliveryDateYearPlusOne);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByYear(year);

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutIdAndDeliveryDateFirstOfYear);
      expect(result[1]).toMatchObject(orderWithoutIdAndDeliveryDateLastOfYear);
    });

    it('should return found orders in database where reservation date has same year as given', async () => {
      // given
      const year: number = 2021;
      const orderWithoutIdAndReservationDateYearMinusOne: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndReservationDateFirstOfYear: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2021-01-01T12:00:00Z') };
      const orderWithoutIdAndReservationDateLastOfYear: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2021-12-31T12:00:00Z') };
      const orderWithoutIdAndReservationDateYearPlusOne: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2022-01-01T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndReservationDateYearMinusOne);
      await databaseOrderRepository.save(orderWithoutIdAndReservationDateFirstOfYear);
      await databaseOrderRepository.save(orderWithoutIdAndReservationDateLastOfYear);
      await databaseOrderRepository.save(orderWithoutIdAndReservationDateYearPlusOne);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByYear(year);

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutIdAndReservationDateFirstOfYear);
      expect(result[1]).toMatchObject(orderWithoutIdAndReservationDateLastOfYear);
    });

    it('should return found orders in database of different types where dates have same year as given', async () => {
      // given
      const year: number = 2021;
      const orderWithoutIdAndHavingPickUpDateSameYear: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2021-06-13T12:00:00Z') };
      const orderWithoutIdAndHavingDeliveryDateSameYear: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2021-06-13T12:00:00Z') };
      const orderWithoutIdAndHavingReservationDateSameYear: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2021-06-13T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndHavingPickUpDateSameYear);
      await databaseOrderRepository.save(orderWithoutIdAndHavingDeliveryDateSameYear);
      await databaseOrderRepository.save(orderWithoutIdAndHavingReservationDateSameYear);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByYear(year);

      // then
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no order matching year has been found in database', async () => {
      // given
      const year: number = 2019;
      const orderWithoutIdAndHavingPickUpDateDifferentYear: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-06-13T12:00:00Z') };
      const orderWithoutIdAndHavingDeliveryDateDifferentYear: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2021-06-13T12:00:00Z') };
      const orderWithoutIdAndHavingReservationDateDifferentYear: OrderInterface = {
        ...orderWithoutId,
        reservationDate: new Date('2022-06-13T12:00:00Z'),
      };
      await databaseOrderRepository.save(orderWithoutIdAndHavingPickUpDateDifferentYear);
      await databaseOrderRepository.save(orderWithoutIdAndHavingDeliveryDateDifferentYear);
      await databaseOrderRepository.save(orderWithoutIdAndHavingReservationDateDifferentYear);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByYear(year);

      // then
      expect(result).toHaveLength(0);
    });
  });

  describe('findAllByDate()', () => {
    it('should return found orders in database where pick-up date has same date as given', async () => {
      // given
      const date: Date = new Date('2020-12-31T12:00:00Z');
      const orderWithoutIdAndSamePickUpDate: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndDifferentPickUpDate: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-12-30T12:00:00Z') };
      const anotherOrderWithoutIdAndSamePickUpDate: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-12-31T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndSamePickUpDate);
      await databaseOrderRepository.save(orderWithoutIdAndDifferentPickUpDate);
      await databaseOrderRepository.save(anotherOrderWithoutIdAndSamePickUpDate);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByDate(date);

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutIdAndSamePickUpDate);
      expect(result[1]).toMatchObject(anotherOrderWithoutIdAndSamePickUpDate);
    });

    it('should return found orders in database where delivery date has same date as given', async () => {
      // given
      const date: Date = new Date('2020-12-31T12:00:00Z');
      const orderWithoutIdAndSameDeliveryDate: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndDifferentDeliveryDate: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2020-12-30T12:00:00Z') };
      const anotherOrderWithoutIdAndSameDeliveryDate: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2020-12-31T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndSameDeliveryDate);
      await databaseOrderRepository.save(orderWithoutIdAndDifferentDeliveryDate);
      await databaseOrderRepository.save(anotherOrderWithoutIdAndSameDeliveryDate);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByDate(date);

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutIdAndSameDeliveryDate);
      expect(result[1]).toMatchObject(anotherOrderWithoutIdAndSameDeliveryDate);
    });

    it('should return found orders in database where reservation date has same date as given', async () => {
      // given
      const date: Date = new Date('2020-12-31T12:00:00Z');
      const orderWithoutIdAndSameReservationDate: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndDifferentReservationDate: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2020-12-30T12:00:00Z') };
      const anotherOrderWithoutIdAndSameReservationDate: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2020-12-31T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndSameReservationDate);
      await databaseOrderRepository.save(orderWithoutIdAndDifferentReservationDate);
      await databaseOrderRepository.save(anotherOrderWithoutIdAndSameReservationDate);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByDate(date);

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(orderWithoutIdAndSameReservationDate);
      expect(result[1]).toMatchObject(anotherOrderWithoutIdAndSameReservationDate);
    });

    it('should return found orders in database of different types where dates are same date as given', async () => {
      // given
      const date: Date = new Date('2020-12-31T12:00:00Z');
      const orderWithoutIdAndSamePickUpDate: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndSameDeliveryDate: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2020-12-31T12:00:00Z') };
      const orderWithoutIdAndSameReservationDate: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2020-12-31T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndSamePickUpDate);
      await databaseOrderRepository.save(orderWithoutIdAndSameDeliveryDate);
      await databaseOrderRepository.save(orderWithoutIdAndSameReservationDate);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByDate(date);

      // then
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no order matching date has been found in database', async () => {
      // given
      const date: Date = new Date('2020-12-31T12:00:00Z');
      const orderWithoutIdAndDifferentPickUpDate: OrderInterface = { ...orderWithoutId, pickUpDate: new Date('2020-12-30T12:00:00Z') };
      const orderWithoutIdAndDifferentDeliveryDate: OrderInterface = { ...orderWithoutId, deliveryDate: new Date('2020-12-30T12:00:00Z') };
      const orderWithoutIdAndDifferentReservationDate: OrderInterface = { ...orderWithoutId, reservationDate: new Date('2020-12-30T12:00:00Z') };
      await databaseOrderRepository.save(orderWithoutIdAndDifferentPickUpDate);
      await databaseOrderRepository.save(orderWithoutIdAndDifferentDeliveryDate);
      await databaseOrderRepository.save(orderWithoutIdAndDifferentReservationDate);

      // when
      const result: OrderInterface[] = await databaseOrderRepository.findAllByDate(date);

      // then
      expect(result).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
