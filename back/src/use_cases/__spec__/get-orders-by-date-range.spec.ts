import { Order } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { GetOrdersByDateRange } from '../get-orders-by-date-range';

describe('use_cases/GetOrdersByDateRange', () => {
  let getOrdersByDateRange: GetOrdersByDateRange;
  let mockOrderRepository: OrderRepository;
  let startDate: Date;
  let endDate: Date;

  beforeEach(() => {
    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.findAllByDate = jest.fn();

    getOrdersByDateRange = new GetOrdersByDateRange(mockOrderRepository);

    startDate = new Date('2020-12-29T12:00:00Z');
    endDate = new Date('2020-12-31T12:00:00Z');
  });

  describe('execute()', () => {
    it('should call findAllByDate repository method with all dates between start and end dates inclusively', async () => {
      // when
      await getOrdersByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(mockOrderRepository.findAllByDate).toHaveBeenNthCalledWith(1, startDate);
      expect(mockOrderRepository.findAllByDate).toHaveBeenNthCalledWith(2, new Date('2020-12-30T12:00:00Z'));
      expect(mockOrderRepository.findAllByDate).toHaveBeenNthCalledWith(3, endDate);
    });

    it('should call findAllByDate repository method only once when start date and end date are the same', async () => {
      // when
      await getOrdersByDateRange.execute(ADMIN, startDate, startDate);

      // then
      expect(mockOrderRepository.findAllByDate).toHaveBeenCalledTimes(1);
    });

    it('should return found orders', async () => {
      // given
      const orders1: Order[] = [{ id: 1, clientName: 'fake order 1' } as Order];
      const orders2: Order[] = [{ id: 2, clientName: 'fake order 2' } as Order];
      const orders3: Order[] = [{ id: 3, clientName: 'fake order 3' } as Order];
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderInterface[] = await getOrdersByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toStrictEqual([...orders1, ...orders2, ...orders3]);
    });

    it('should return found orders with dates returning no orders', async () => {
      // given
      const orders1: Order[] = [{ id: 1, clientName: 'fake order 1' } as Order];
      const orders2: Order[] = [];
      const orders3: Order[] = undefined;
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderInterface[] = await getOrdersByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toStrictEqual([...orders1]);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<OrderInterface[]> = getOrdersByDateRange.execute(user, null, null);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<OrderInterface[]> = getOrdersByDateRange.execute(user, null, null);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
