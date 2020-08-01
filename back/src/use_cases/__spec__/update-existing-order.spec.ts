import { ClosingPeriodInterface } from '../../domain/closing-period/closing-period.interface';
import { ClosingPeriodRepository } from '../../domain/closing-period/closing-period.repository';
import { UpdateOrderCommand } from '../../domain/order/commands/update-order-command';
import { Order, OrderFactoryInterface } from '../../domain/order/order';
import { OrderType } from '../../domain/order/order-type';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { Product } from '../../domain/product/product';
import { ProductStatus } from '../../domain/product/product-status';
import { ProductRepository } from '../../domain/product/product.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { UpdateExistingOrder } from '../update-existing-order';

describe('uses_cases/UpdateExistingOrder', () => {
  let updateExistingOrder: UpdateExistingOrder;
  let mockProductRepository: ProductRepository;
  let mockClosingPeriodRepository: ClosingPeriodRepository;
  let mockOrderRepository: OrderRepository;
  let updateOrderCommand: UpdateOrderCommand;
  let orderToUpdate: Order;

  beforeEach(() => {
    Order.factory = {} as OrderFactoryInterface;
    Order.factory.copy = jest.fn();

    orderToUpdate = { clientName: 'fake order' } as Order;
    orderToUpdate.updateWith = jest.fn();
    (Order.factory.copy as jest.Mock).mockReturnValue(orderToUpdate);

    mockProductRepository = {} as ProductRepository;
    mockProductRepository.findAllByStatus = jest.fn();

    mockClosingPeriodRepository = {} as ClosingPeriodRepository;
    mockClosingPeriodRepository.findAll = jest.fn();

    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.save = jest.fn();
    mockOrderRepository.findById = jest.fn();

    updateExistingOrder = new UpdateExistingOrder(mockProductRepository, mockClosingPeriodRepository, mockOrderRepository);

    updateOrderCommand = {
      orderId: 42,
      products: [{ productId: 42, quantity: 1 }],
      type: OrderType.DELIVERY,
      deliveryAddress: 'Laval',
    };
  });

  describe('execute()', () => {
    it('should search for existing order', async () => {
      // given
      updateOrderCommand.orderId = 1337;

      // when
      await updateExistingOrder.execute(ADMIN, updateOrderCommand);

      // then
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should search for active products', async () => {
      // when
      await updateExistingOrder.execute(ADMIN, updateOrderCommand);

      // then
      expect(mockProductRepository.findAllByStatus).toHaveBeenCalledWith(ProductStatus.ACTIVE);
    });

    it('should copy found order in order to update it', async () => {
      // given
      const existingOrder: OrderInterface = { clientName: 'fake order' } as OrderInterface;
      (mockOrderRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingOrder));

      // when
      await updateExistingOrder.execute(ADMIN, updateOrderCommand);

      // then
      expect(Order.factory.copy).toHaveBeenCalledWith(existingOrder);
    });

    it('should update existing order with command, all products, and closing periods', async () => {
      // given
      const activeProducts: Product[] = [{ id: 42, name: 'Product 1' } as Product, { id: 1337, name: 'Product 2' } as Product];
      (mockProductRepository.findAllByStatus as jest.Mock).mockReturnValue(Promise.resolve(activeProducts));

      const closingPeriods: ClosingPeriodInterface[] = [
        { id: 1, startDate: new Date('2019-12-23T12:00:00.000Z'), endDate: new Date('2019-12-28T12:00:00.000Z') },
        { id: 2, startDate: new Date('2020-07-15T12:00:00.000Z'), endDate: new Date('2020-08-15T12:00:00.000Z') },
      ];
      (mockClosingPeriodRepository.findAll as jest.Mock).mockReturnValue(Promise.resolve(closingPeriods));

      // when
      await updateExistingOrder.execute(ADMIN, updateOrderCommand);

      // then
      expect(orderToUpdate.updateWith).toHaveBeenCalledWith(updateOrderCommand, activeProducts, closingPeriods);
    });

    it('should save updated order', async () => {
      // when
      await updateExistingOrder.execute(ADMIN, updateOrderCommand);

      // then
      expect(mockOrderRepository.save).toHaveBeenCalledWith(orderToUpdate);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = updateExistingOrder.execute(user, updateOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = updateExistingOrder.execute(user, updateOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
