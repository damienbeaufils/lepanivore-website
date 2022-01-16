import { CheckOrderCommand } from '../domain/order/commands/check-order-command';
import { Order } from '../domain/order/order';
import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { OrderId } from '../domain/type-aliases';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class CheckOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(user: User, checkOrderCommand: CheckOrderCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const foundOrder: OrderInterface = await this.orderRepository.findById(checkOrderCommand.orderId);
    const orderToUpdate: Order = Order.factory.copy(foundOrder);
    orderToUpdate.check();
    await this.orderRepository.save(orderToUpdate);
  }
}
