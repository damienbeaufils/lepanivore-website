import { ClosingPeriodInterface } from '../domain/closing-period/closing-period.interface';
import { ClosingPeriodRepository } from '../domain/closing-period/closing-period.repository';
import { UpdateOrderCommand } from '../domain/order/commands/update-order-command';
import { Order } from '../domain/order/order';
import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { ProductStatus } from '../domain/product/product-status';
import { ProductInterface } from '../domain/product/product.interface';
import { ProductRepository } from '../domain/product/product.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class UpdateExistingOrder {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly closingPeriodRepository: ClosingPeriodRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(user: User, updateOrderCommand: UpdateOrderCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const activeProducts: ProductInterface[] = await this.productRepository.findAllByStatus(ProductStatus.ACTIVE);
    const closingPeriods: ClosingPeriodInterface[] = await this.closingPeriodRepository.findAll();

    const foundOrder: OrderInterface = await this.orderRepository.findById(updateOrderCommand.orderId);
    const orderToUpdate: Order = Order.factory.copy(foundOrder);
    orderToUpdate.updateWith(updateOrderCommand, activeProducts, closingPeriods);
    await this.orderRepository.save(orderToUpdate);
  }
}
