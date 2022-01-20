import { Order } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { GetLastOrders } from '../get-last-orders';
import { GetOrders } from '../get-orders';

describe('use_cases/GetLastOrders', () => {
  let getLastOrders: GetLastOrders;
  let mockOrderRepository: OrderRepository;

  beforeEach(() => {
    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.findTopByOrderByIdDesc = jest.fn();

    getLastOrders = new GetLastOrders(mockOrderRepository);
  });

  describe('execute()', () => {
    it('should call findTopByOrderByIdDesc method on repository to find orders using given number of orders to return', async () => {
      // given
      const numberOfOrders: number = 42;

      // when
      await getLastOrders.execute(ADMIN, numberOfOrders);

      // then
      expect(mockOrderRepository.findTopByOrderByIdDesc).toHaveBeenCalledWith(numberOfOrders);
    });

    it('should return last orders corresponding to given number of orders', async () => {
      // given
      const orders: Order[] = [{ id: 3, clientName: 'fake order 3' } as Order, { id: 4, clientName: 'fake order 4' } as Order];
      (mockOrderRepository.findTopByOrderByIdDesc as jest.Mock).mockReturnValue(Promise.resolve(orders));

      // when
      const result: OrderInterface[] = await getLastOrders.execute(ADMIN, 2);

      // then
      expect(result).toStrictEqual(orders);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<OrderInterface[]> = getLastOrders.execute(user, 42);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<OrderInterface[]> = getLastOrders.execute(user, 42);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
