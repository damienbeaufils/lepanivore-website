import { OrderType } from '../../../../domain/order/order-type';
import { OrderInterface } from '../../../../domain/order/order.interface';
import { ProductStatus } from '../../../../domain/product/product-status';
import { OrderEntityTransformer } from '../order-entity.transformer';
import { OrderEntity } from '../order.entity';

describe('infrastructure/repositories/entities/OrderEntityTransformer', () => {
  let orderEntityTransformer: OrderEntityTransformer;
  beforeEach(() => {
    orderEntityTransformer = new OrderEntityTransformer();
  });

  describe('from()', () => {
    it('should transform OrderEntity to OrderInterface', () => {
      // given
      const orderEntity: OrderEntity = {
        id: 42,
        clientName: 'John Doe',
        clientEmailAddress: 'test@example.org',
        clientPhoneNumber: '+1 514 111 1111',
        products: [
          '{"id":1,"name":"product 1","description":"product 1 description","price":1.11,"status":"ACTIVE"}:::1',
          '{"id":2,"name":"product 2","description":"product 2 description","price":2.22,"status":"ARCHIVED"}:::2',
        ],
        type: 'PICK_UP',
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        deliveryAddress: 'Montréal',
        note: 'a note',
      } as OrderEntity;

      // when
      const result: OrderInterface = orderEntityTransformer.from(orderEntity);

      // then
      expect(result).toStrictEqual({
        id: 42,
        clientName: 'John Doe',
        clientPhoneNumber: '+1 514 111 1111',
        clientEmailAddress: 'test@example.org',
        products: [
          { product: { id: 1, name: 'product 1', description: 'product 1 description', price: 1.11, status: ProductStatus.ACTIVE }, quantity: 1 },
          { product: { id: 2, name: 'product 2', description: 'product 2 description', price: 2.22, status: ProductStatus.ARCHIVED }, quantity: 2 },
        ],
        type: OrderType.PICK_UP,
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        deliveryAddress: 'Montréal',
        note: 'a note',
      } as OrderInterface);
    });
  });

  describe('to()', () => {
    it('should transform OrderInterface to OrderEntity', () => {
      // given
      const order: OrderInterface = {
        id: 42,
        clientName: 'John Doe',
        clientPhoneNumber: '+1 514 111 1111',
        clientEmailAddress: 'test@example.org',
        products: [
          { product: { id: 1, name: 'product 1', description: 'product 1 description', price: 1.11, status: ProductStatus.ACTIVE }, quantity: 1 },
          { product: { id: 2, name: 'product 2', description: 'product 2 description', price: 2.22, status: ProductStatus.ARCHIVED }, quantity: 2 },
        ],
        type: OrderType.PICK_UP,
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        deliveryAddress: 'Montréal',
        note: 'a note',
      };

      // when
      const result: OrderEntity = orderEntityTransformer.to(order);

      // then
      expect(result).toMatchObject({
        id: 42,
        clientName: 'John Doe',
        clientEmailAddress: 'test@example.org',
        clientPhoneNumber: '+1 514 111 1111',
        products: [
          '{"id":1,"name":"product 1","description":"product 1 description","price":1.11,"status":"ACTIVE"}:::1',
          '{"id":2,"name":"product 2","description":"product 2 description","price":2.22,"status":"ARCHIVED"}:::2',
        ],
        type: 'PICK_UP',
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        deliveryAddress: 'Montréal',
        note: 'a note',
      } as OrderEntity);
    });
  });
});
