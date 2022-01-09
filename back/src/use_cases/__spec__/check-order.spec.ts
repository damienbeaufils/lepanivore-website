import { CheckOrderCommand } from '../../domain/order/commands/check-order-command';
import { Order, OrderFactoryInterface } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { CheckOrder } from '../check-order';

describe('uses_cases/CheckOrder', () => {
  let checkOrder: CheckOrder;
  let mockOrderRepository: OrderRepository;
  let checkOrderCommand: CheckOrderCommand;
  let orderToUpdate: Order;

  beforeEach(() => {
    Order.factory = {} as OrderFactoryInterface;
    Order.factory.copy = jest.fn();

    orderToUpdate = { clientName: 'fake order' } as Order;
    orderToUpdate.check = jest.fn();
    (Order.factory.copy as jest.Mock).mockReturnValue(orderToUpdate);

    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.save = jest.fn();
    mockOrderRepository.findById = jest.fn();

    checkOrder = new CheckOrder(mockOrderRepository);
    checkOrderCommand = {
      orderId: 42,
    };
  });

  describe('execute()', () => {
    it('should search for existing order', async () => {
      // given
      checkOrderCommand.orderId = 1337;

      // when
      await checkOrder.execute(ADMIN, checkOrderCommand);

      // then
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should copy found order in order to update it', async () => {
      // given
      const existingOrder: OrderInterface = { clientName: 'fake order' } as OrderInterface;
      (mockOrderRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingOrder));

      // when
      await checkOrder.execute(ADMIN, checkOrderCommand);

      // then
      expect(Order.factory.copy).toHaveBeenCalledWith(existingOrder);
    });

    it('should mark order as checked', async () => {
      // when
      await checkOrder.execute(ADMIN, checkOrderCommand);

      // then
      expect(orderToUpdate.check).toHaveBeenCalled();
    });

    it('should save updated order', async () => {
      // when
      await checkOrder.execute(ADMIN, checkOrderCommand);

      // then
      expect(mockOrderRepository.save).toHaveBeenCalledWith(orderToUpdate);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = checkOrder.execute(user, checkOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = checkOrder.execute(user, checkOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
