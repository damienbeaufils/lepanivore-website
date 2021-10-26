import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class GetOrdersByDateRange {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(user: User, startDate: Date, endDate: Date): Promise<OrderInterface[]> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const result: OrderInterface[] = [];
    for (const date: Date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const foundOrders: OrderInterface[] = await this.orderRepository.findAllByDate(new Date(date));
      if (foundOrders) {
        result.push(...foundOrders);
      }
    }

    return result;
  }
}
