import { DeleteOrderCommand } from '../../domain/order/commands/delete-order-command';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { DeleteOrder } from '../delete-order';

describe('uses_cases/DeleteOrder', () => {
  let deleteOrder: DeleteOrder;
  let mockOrderRepository: OrderRepository;
  let deleteOrderCommand: DeleteOrderCommand;

  beforeEach(() => {
    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.delete = jest.fn();
    mockOrderRepository.findById = jest.fn();

    deleteOrder = new DeleteOrder(mockOrderRepository);

    deleteOrderCommand = {
      orderId: 42,
    };
  });

  describe('execute()', () => {
    it('should search for existing order', async () => {
      // given
      deleteOrderCommand.orderId = 1337;

      // when
      await deleteOrder.execute(ADMIN, deleteOrderCommand);

      // then
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should delete found order', async () => {
      // given
      const existingOrder: OrderInterface = { clientName: 'fake order' } as OrderInterface;
      (mockOrderRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingOrder));

      // when
      await deleteOrder.execute(ADMIN, deleteOrderCommand);

      // then
      expect(mockOrderRepository.delete).toHaveBeenCalledWith(existingOrder);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = deleteOrder.execute(user, deleteOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = deleteOrder.execute(user, deleteOrderCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
