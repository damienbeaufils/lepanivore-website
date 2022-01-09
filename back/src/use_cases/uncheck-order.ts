import { UncheckOrderCommand } from '../domain/order/commands/uncheck-order-command';
import { Order } from '../domain/order/order';
import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class UncheckOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(user: User, uncheckOrderCommand: UncheckOrderCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const foundOrder: OrderInterface = await this.orderRepository.findById(uncheckOrderCommand.orderId);
    const orderToUpdate: Order = Order.factory.copy(foundOrder);
    orderToUpdate.uncheck();
    await this.orderRepository.save(orderToUpdate);
  }
}
