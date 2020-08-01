import { Order } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { GetOrders } from '../get-orders';

describe('use_cases/GetOrders', () => {
  let getOrders: GetOrders;
  let mockOrderRepository: OrderRepository;

  beforeEach(() => {
    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.findAll = jest.fn();

    getOrders = new GetOrders(mockOrderRepository);
  });

  describe('execute()', () => {
    it('should return found products', async () => {
      // given
      const orders: Order[] = [
        { id: 1, clientName: 'fake order 1' } as Order,
        {
          id: 2,
          clientName: 'fake order 2',
        } as Order,
      ];
      (mockOrderRepository.findAll as jest.Mock).mockReturnValue(Promise.resolve(orders));

      // when
      const result: OrderInterface[] = await getOrders.execute(ADMIN);

      // then
      expect(result).toStrictEqual(orders);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<OrderInterface[]> = getOrders.execute(user);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<OrderInterface[]> = getOrders.execute(user);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
