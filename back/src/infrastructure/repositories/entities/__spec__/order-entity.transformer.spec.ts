import { OrderType } from '../../../../domain/order/order-type';
import { OrderInterface } from '../../../../domain/order/order.interface';
import { ProductStatus } from '../../../../domain/product/product-status';
import { EncryptionService } from '../../../config/encryption/encryption.service';
import { OrderEntityTransformer } from '../order-entity.transformer';
import { OrderEntity } from '../order.entity';

describe('infrastructure/repositories/entities/OrderEntityTransformer', () => {
  let orderEntityTransformer: OrderEntityTransformer;
  let mockEncryptionService: EncryptionService;

  beforeEach(() => {
    mockEncryptionService = {} as EncryptionService;
    mockEncryptionService.encrypt = jest.fn();
    mockEncryptionService.decrypt = jest.fn();

    orderEntityTransformer = new OrderEntityTransformer(mockEncryptionService);
  });

  describe('from()', () => {
    it('should transform OrderEntity to OrderInterface', async () => {
      // given
      const orderEntity: OrderEntity = {
        id: 42,
        products: [
          '{"id":1,"name":"product 1","description":"product 1 description","price":1.11,"status":"ACTIVE"}:::1',
          '{"id":2,"name":"product 2","description":"product 2 description","price":2.22,"status":"ARCHIVED"}:::2',
        ],
        type: 'PICK_UP',
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        note: 'a note',
        checked: true,
      } as OrderEntity;

      // when
      const result: OrderInterface = await orderEntityTransformer.from(orderEntity);

      // then
      expect(result).toMatchObject({
        id: 42,
        products: [
          { product: { id: 1, name: 'product 1', description: 'product 1 description', price: 1.11, status: ProductStatus.ACTIVE }, quantity: 1 },
          { product: { id: 2, name: 'product 2', description: 'product 2 description', price: 2.22, status: ProductStatus.ARCHIVED }, quantity: 2 },
        ],
        type: OrderType.PICK_UP,
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        note: 'a note',
        checked: true,
      } as OrderInterface);
    });

    it('should decrypt encrypted personal data', async () => {
      // given
      const orderEntity: OrderEntity = {
        clientName: 'ENCRYPTED_CLIENT_NAME',
        clientPhoneNumber: 'ENCRYPTED_PHONE_NUMBER',
        clientEmailAddress: 'ENCRYPTED_EMAIL_ADDRESS',
        deliveryAddress: 'ENCRYPTED_DELIVERY_ADDRESS',
        products: [],
      } as OrderEntity;

      (mockEncryptionService.decrypt as jest.Mock).mockImplementation(async (value: string) => {
        if (value === 'ENCRYPTED_CLIENT_NAME') return Promise.resolve('John Doe');
        if (value === 'ENCRYPTED_PHONE_NUMBER') return Promise.resolve('+1 514 111 1111');
        if (value === 'ENCRYPTED_EMAIL_ADDRESS') return Promise.resolve('test@example.org');
        if (value === 'ENCRYPTED_DELIVERY_ADDRESS') return Promise.resolve('Montréal');
      });

      // when
      const result: OrderInterface = await orderEntityTransformer.from(orderEntity);

      // then
      expect(result).toMatchObject({
        clientName: 'John Doe',
        clientPhoneNumber: '+1 514 111 1111',
        clientEmailAddress: 'test@example.org',
        deliveryAddress: 'Montréal',
      } as OrderInterface);
    });

    it('should not decrypt empty delivery address when order is not a delivery', async () => {
      // given
      const orderEntity: OrderEntity = {
        deliveryAddress: null,
        products: [],
      } as OrderEntity;

      (mockEncryptionService.decrypt as jest.Mock).mockReturnValue('some decrypted value');

      // when
      const result: OrderInterface = await orderEntityTransformer.from(orderEntity);

      // then
      expect(result).toMatchObject({
        deliveryAddress: null,
      } as OrderInterface);
    });
  });

  describe('to()', () => {
    it('should transform OrderInterface to OrderEntity', async () => {
      // given
      const order: OrderInterface = {
        id: 42,
        products: [
          { product: { id: 1, name: 'product 1', description: 'product 1 description', price: 1.11, status: ProductStatus.ACTIVE }, quantity: 1 },
          { product: { id: 2, name: 'product 2', description: 'product 2 description', price: 2.22, status: ProductStatus.ARCHIVED }, quantity: 2 },
        ],
        type: OrderType.PICK_UP,
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        note: 'a note',
        checked: true,
      } as OrderInterface;

      // when
      const result: OrderEntity = await orderEntityTransformer.to(order);

      // then
      expect(result).toMatchObject({
        id: 42,
        products: [
          '{"id":1,"name":"product 1","description":"product 1 description","price":1.11,"status":"ACTIVE"}:::1',
          '{"id":2,"name":"product 2","description":"product 2 description","price":2.22,"status":"ARCHIVED"}:::2',
        ],
        type: 'PICK_UP',
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryDate: new Date('2030-06-13T04:41:20'),
        reservationDate: new Date('2040-06-13T04:41:20'),
        note: 'a note',
        checked: true,
      } as OrderEntity);
    });

    it('should encrypt personal data', async () => {
      // given
      const order: OrderInterface = {
        clientName: 'John Doe',
        clientPhoneNumber: '+1 514 111 1111',
        clientEmailAddress: 'test@example.org',
        deliveryAddress: 'Montréal',
        products: [],
      } as OrderInterface;

      (mockEncryptionService.encrypt as jest.Mock).mockImplementation(async (value: string) => {
        if (value === 'John Doe') return Promise.resolve('ENCRYPTED_CLIENT_NAME');
        if (value === '+1 514 111 1111') return Promise.resolve('ENCRYPTED_PHONE_NUMBER');
        if (value === 'test@example.org') return Promise.resolve('ENCRYPTED_EMAIL_ADDRESS');
        if (value === 'Montréal') return Promise.resolve('ENCRYPTED_DELIVERY_ADDRESS');
      });

      // when
      const result: OrderEntity = await orderEntityTransformer.to(order);

      // then
      expect(result).toMatchObject({
        clientName: 'ENCRYPTED_CLIENT_NAME',
        clientPhoneNumber: 'ENCRYPTED_PHONE_NUMBER',
        clientEmailAddress: 'ENCRYPTED_EMAIL_ADDRESS',
        deliveryAddress: 'ENCRYPTED_DELIVERY_ADDRESS',
      } as OrderEntity);
    });

    it('should not encrypt empty delivery address when order is not a delivery', async () => {
      // given
      const order: OrderInterface = {
        deliveryAddress: null,
        products: [],
      } as OrderInterface;

      (mockEncryptionService.encrypt as jest.Mock).mockReturnValue('some encrypted value');

      // when
      const result: OrderEntity = await orderEntityTransformer.to(order);

      // then
      expect(result).toMatchObject({
        deliveryAddress: null,
      } as OrderEntity);
    });
  });
});
