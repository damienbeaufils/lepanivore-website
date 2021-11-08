import { Order } from '../../domain/order/order';
import { OrderInterface } from '../../domain/order/order.interface';
import { OrderRepository } from '../../domain/order/order.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { GetOrderedProductsByDateRange } from '../get-ordered-products-by-date-range';
import { OrderType } from '../../domain/order/order-type';
import { OrderedProductInterface } from '../../domain/order/ordered-product.interface';

describe('use_cases/GetOrderedProductsByDateRange', () => {
  let getOrderedProductsByDateRange: GetOrderedProductsByDateRange;
  let mockOrderRepository: OrderRepository;
  let startDate: Date;
  let endDate: Date;

  beforeEach(() => {
    mockOrderRepository = {} as OrderRepository;
    mockOrderRepository.findAllByDate = jest.fn();

    getOrderedProductsByDateRange = new GetOrderedProductsByDateRange(mockOrderRepository);

    startDate = new Date('2020-12-29T12:00:00Z');
    endDate = new Date('2020-12-31T12:00:00Z');
  });

  describe('execute()', () => {
    it('should call findAllByDate repository method with all dates between start and end dates inclusively', async () => {
      // when
      await getOrderedProductsByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(mockOrderRepository.findAllByDate).toHaveBeenNthCalledWith(1, startDate);
      expect(mockOrderRepository.findAllByDate).toHaveBeenNthCalledWith(2, new Date('2020-12-30T12:00:00Z'));
      expect(mockOrderRepository.findAllByDate).toHaveBeenNthCalledWith(3, endDate);
    });

    it('should call findAllByDate repository method only once when start date and end date are the same', async () => {
      // when
      await getOrderedProductsByDateRange.execute(ADMIN, startDate, startDate);

      // then
      expect(mockOrderRepository.findAllByDate).toHaveBeenCalledTimes(1);
    });

    it('should return ordered products grouped by name with pick up count', async () => {
      // given
      const orders1: Order[] = [{ id: 1, products: [{ product: { name: 'product A' }, quantity: 1 }], type: OrderType.PICK_UP } as Order];
      const orders2: Order[] = [
        {
          id: 2,
          products: [
            { product: { name: 'product B' }, quantity: 1 },
            { product: { name: 'product C' }, quantity: 2 },
          ],
          type: OrderType.PICK_UP,
        } as Order,
      ];
      const orders3: Order[] = [
        { id: 3, products: [{ product: { name: 'product A' }, quantity: 2 }], type: OrderType.PICK_UP } as Order,
        { id: 4, products: [{ product: { name: 'product B' }, quantity: 2 }], type: OrderType.PICK_UP } as Order,
      ];
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderedProductInterface[] = await getOrderedProductsByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toStrictEqual([
        { name: 'product A', pickUpCount: 3, deliveryCount: 0, reservationCount: 0, totalCount: 3 },
        { name: 'product B', pickUpCount: 3, deliveryCount: 0, reservationCount: 0, totalCount: 3 },
        { name: 'product C', pickUpCount: 2, deliveryCount: 0, reservationCount: 0, totalCount: 2 },
      ]);
    });

    it('should return ordered products grouped by name with delivery count', async () => {
      // given
      const orders1: Order[] = [{ id: 1, products: [{ product: { name: 'product A' }, quantity: 1 }], type: OrderType.DELIVERY } as Order];
      const orders2: Order[] = [
        {
          id: 2,
          products: [
            { product: { name: 'product B' }, quantity: 1 },
            { product: { name: 'product C' }, quantity: 2 },
          ],
          type: OrderType.DELIVERY,
        } as Order,
      ];
      const orders3: Order[] = [
        { id: 3, products: [{ product: { name: 'product A' }, quantity: 2 }], type: OrderType.DELIVERY } as Order,
        { id: 4, products: [{ product: { name: 'product B' }, quantity: 2 }], type: OrderType.DELIVERY } as Order,
      ];
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderedProductInterface[] = await getOrderedProductsByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toStrictEqual([
        { name: 'product A', pickUpCount: 0, deliveryCount: 3, reservationCount: 0, totalCount: 3 },
        { name: 'product B', pickUpCount: 0, deliveryCount: 3, reservationCount: 0, totalCount: 3 },
        { name: 'product C', pickUpCount: 0, deliveryCount: 2, reservationCount: 0, totalCount: 2 },
      ]);
    });

    it('should return ordered products grouped by name with reservation count', async () => {
      // given
      const orders1: Order[] = [{ id: 1, products: [{ product: { name: 'product A' }, quantity: 1 }], type: OrderType.RESERVATION } as Order];
      const orders2: Order[] = [
        {
          id: 2,
          products: [
            { product: { name: 'product B' }, quantity: 1 },
            { product: { name: 'product C' }, quantity: 2 },
          ],
          type: OrderType.RESERVATION,
        } as Order,
      ];
      const orders3: Order[] = [
        { id: 3, products: [{ product: { name: 'product A' }, quantity: 2 }], type: OrderType.RESERVATION } as Order,
        { id: 4, products: [{ product: { name: 'product B' }, quantity: 2 }], type: OrderType.RESERVATION } as Order,
      ];
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderedProductInterface[] = await getOrderedProductsByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toStrictEqual([
        { name: 'product A', pickUpCount: 0, deliveryCount: 0, reservationCount: 3, totalCount: 3 },
        { name: 'product B', pickUpCount: 0, deliveryCount: 0, reservationCount: 3, totalCount: 3 },
        { name: 'product C', pickUpCount: 0, deliveryCount: 0, reservationCount: 2, totalCount: 2 },
      ]);
    });

    it('should return ordered products grouped by name with different types', async () => {
      // given
      const orders1: Order[] = [{ id: 1, products: [{ product: { name: 'product A' }, quantity: 1 }], type: OrderType.PICK_UP } as Order];
      const orders2: Order[] = [{ id: 2, products: [{ product: { name: 'product B' }, quantity: 2 }], type: OrderType.DELIVERY } as Order];
      const orders3: Order[] = [{ id: 3, products: [{ product: { name: 'product C' }, quantity: 3 }], type: OrderType.RESERVATION } as Order];
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderedProductInterface[] = await getOrderedProductsByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toStrictEqual([
        { name: 'product A', pickUpCount: 1, deliveryCount: 0, reservationCount: 0, totalCount: 1 },
        { name: 'product B', pickUpCount: 0, deliveryCount: 2, reservationCount: 0, totalCount: 2 },
        { name: 'product C', pickUpCount: 0, deliveryCount: 0, reservationCount: 3, totalCount: 3 },
      ]);
    });

    it('should return found orders with dates returning no orders', async () => {
      // given
      const orders1: Order[] = [{ id: 1, products: [{ product: { name: 'product A' }, quantity: 1 }], type: OrderType.PICK_UP } as Order];
      const orders2: Order[] = [];
      const orders3: Order[] = undefined;
      (mockOrderRepository.findAllByDate as jest.Mock)
        .mockReturnValueOnce(Promise.resolve(orders1))
        .mockReturnValueOnce(Promise.resolve(orders2))
        .mockReturnValueOnce(Promise.resolve(orders3));

      // when
      const result: OrderedProductInterface[] = await getOrderedProductsByDateRange.execute(ADMIN, startDate, endDate);

      // then
      expect(result).toHaveLength(1);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<OrderedProductInterface[]> = getOrderedProductsByDateRange.execute(user, null, null);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<OrderedProductInterface[]> = getOrderedProductsByDateRange.execute(user, null, null);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
