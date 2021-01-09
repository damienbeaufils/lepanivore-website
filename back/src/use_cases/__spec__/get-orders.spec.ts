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
    mockOrderRepository.findAllByYear = jest.fn();

    getOrders = new GetOrders(mockOrderRepository);
  });

  describe('execute()', () => {
    it('should return all orders when no year given', async () => {
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

    it('should call findAllByYear method on repository to find orders using given year', async () => {
      // given
      const year: number = 2021;

      // when
      await getOrders.execute(ADMIN, year);

      // then
      expect(mockOrderRepository.findAllByYear).toHaveBeenCalledWith(year);
    });

    it('should return found orders corresponding to given year', async () => {
      // given
      const orders: Order[] = [{ id: 3, clientName: 'fake order 3' } as Order, { id: 4, clientName: 'fake order 4' } as Order];
      (mockOrderRepository.findAllByYear as jest.Mock).mockReturnValue(Promise.resolve(orders));

      // when
      const result: OrderInterface[] = await getOrders.execute(ADMIN, 2021);

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
