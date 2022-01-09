import { Order } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { GetOrdersByDate } from '../get-orders-by-date';

describe('use_cases/GetOrdersByDate', () => {
  let getOrdersByDate: GetOrdersByDate;
  let mockOrderRepository: OrderRepository;

  beforeEach(() => {
    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.findAllByDate = jest.fn();

    getOrdersByDate = new GetOrdersByDate(mockOrderRepository);
  });

  describe('execute()', () => {
    it('should return all orders matching given date', async () => {
      // given
      const date: Date = new Date('2020-06-13T12:00:00Z');

      // when
      await getOrdersByDate.execute(ADMIN, date);

      // then
      expect(mockOrderRepository.findAllByDate).toHaveBeenCalledWith(date);
    });

    it('should return found orders', async () => {
      // given
      const orders: Order[] = [{ id: 3, clientName: 'fake order 3' } as Order, { id: 4, clientName: 'fake order 4' } as Order];
      (mockOrderRepository.findAllByDate as jest.Mock).mockReturnValue(Promise.resolve(orders));

      // when
      const result: OrderInterface[] = await getOrdersByDate.execute(ADMIN, new Date());

      // then
      expect(result).toStrictEqual(orders);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<OrderInterface[]> = getOrdersByDate.execute(user, new Date());

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<OrderInterface[]> = getOrdersByDate.execute(user, new Date());

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
