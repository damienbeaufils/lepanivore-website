import { ClosingPeriodInterface } from '../domain/closing-period/closing-period.interface';
import { ClosingPeriodRepository } from '../domain/closing-period/closing-period.repository';
import { ProductOrderingDisabledError } from '../domain/feature/errors/product-ordering-disabled.error';
import { Feature } from '../domain/feature/feature';
import { FeatureStatus } from '../domain/feature/feature-status';
import { FeatureInterface } from '../domain/feature/feature.interface';
import { FeatureRepository } from '../domain/feature/feature.repository';
import { OrderNotification } from '../domain/order-notification/order-notification';
import { OrderNotificationRepository } from '../domain/order-notification/order-notification.repository';
import { NewOrderCommand } from '../domain/order/commands/new-order-command';
import { Order } from '../domain/order/order';
import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { ProductStatus } from '../domain/product/product-status';
import { ProductInterface } from '../domain/product/product.interface';
import { ProductRepository } from '../domain/product/product.repository';
import { OrderId } from '../domain/type-aliases';
import { isAdmin, User } from '../domain/user/user';

export class OrderProducts {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly closingPeriodRepository: ClosingPeriodRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderNotificationRepository: OrderNotificationRepository,
    private readonly featureRepository: FeatureRepository
  ) {}

  async execute(user: User, newOrderCommand: NewOrderCommand): Promise<OrderId> {
    const productOrderingFeature: FeatureInterface = await this.featureRepository.findByName(Feature.PRODUCT_ORDERING_FEATURE_NAME);
    if (productOrderingFeature.status === FeatureStatus.DISABLED) {
      return Promise.reject(new ProductOrderingDisabledError('Product ordering feature has to be enabled to order products'));
    }

    const isUserAdmin: boolean = isAdmin(user);
    const order: OrderInterface = await this.createOrder(isUserAdmin, newOrderCommand);
    if (!isUserAdmin) {
      await this.sendOrderNotification(order);
    }

    return order.id;
  }

  private async createOrder(isUserAdmin: boolean, newOrderCommand: NewOrderCommand): Promise<OrderInterface> {
    const activeProducts: ProductInterface[] = await this.productRepository.findAllByStatus(ProductStatus.ACTIVE);
    const closingPeriods: ClosingPeriodInterface[] = await this.closingPeriodRepository.findAll();

    const order: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods, isUserAdmin);
    const orderId: OrderId = await this.orderRepository.save(order);

    return { ...order, id: orderId };
  }

  private async sendOrderNotification(order: OrderInterface): Promise<void> {
    const orderNotification: OrderNotification = OrderNotification.factory.create(order);
    await this.orderNotificationRepository.send(orderNotification);
  }
}
