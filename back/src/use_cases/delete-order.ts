import { DeleteOrderCommand } from '../domain/order/commands/delete-order-command';
import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class DeleteOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(user: User, deleteOrderCommand: DeleteOrderCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const orderToDelete: OrderInterface = await this.orderRepository.findById(deleteOrderCommand.orderId);
    await this.orderRepository.delete(orderToDelete);
  }
}
