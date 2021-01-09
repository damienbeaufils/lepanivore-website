import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class GetOrders {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(user: User, year?: number): Promise<OrderInterface[]> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    if (year) {
      return this.orderRepository.findAllByYear(year);
    } else {
      return this.orderRepository.findAll();
    }
  }
}
