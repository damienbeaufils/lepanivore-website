import { UncheckOrderCommand } from '../../domain/order/commands/uncheck-order-command';
import { Order, OrderFactoryInterface } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { OrderId } from '../../domain/type-aliases';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { UncheckOrder } from '../uncheck-order';

describe('uses_cases/UncheckOrder', () => {
  let uncheckOrder: UncheckOrder;
  let mockOrderRepository: OrderRepository;
  let uncheckOrderCommand: UncheckOrderCommand;
  let orderToUpdate: Order;

  beforeEach(() => {
    Order.factory = {} as OrderFactoryInterface;
    Order.factory.copy = jest.fn();

    orderToUpdate = { clientName: 'fake order' } as Order;
    orderToUpdate.uncheck = jest.fn();
    (Order.factory.copy as jest.Mock).mockReturnValue(orderToUpdate);

    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.save = jest.fn();
    mockOrderRepository.findById = jest.fn();

    uncheckOrder = new UncheckOrder(mockOrderRepository);
    uncheckOrderCommand = {
      orderId: 42,
    };
  });

  describe('execute()', () => {
    it('should search for existing order', async () => {
      // given
      uncheckOrderCommand.orderId = 1337;

      // when
      await uncheckOrder.execute(ADMIN, uncheckOrderCommand);

      // then
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should copy found order in order to update it', async () => {
      // given
      const existingOrder: OrderInterface = { clientName: 'fake order' } as OrderInterface;
      (mockOrderRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingOrder));

      // when
      await uncheckOrder.execute(ADMIN, uncheckOrderCommand);

      // then
      expect(Order.factory.copy).toHaveBeenCalledWith(existingOrder);
    });

    it('should mark order as unchecked', async () => {
      // when
      await uncheckOrder.execute(ADMIN, uncheckOrderCommand);

      // then
      expect(orderToUpdate.uncheck).toHaveBeenCalled();
    });

    it('should save updated order', async () => {
      // when
      await uncheckOrder.execute(ADMIN, uncheckOrderCommand);

      // then
      expect(mockOrderRepository.save).toHaveBeenCalledWith(orderToUpdate);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = uncheckOrder.execute(user, uncheckOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = uncheckOrder.execute(user, uncheckOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
