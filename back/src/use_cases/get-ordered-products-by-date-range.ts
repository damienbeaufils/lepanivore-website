import { OrderInterface } from '../domain/order/order.interface';
import { OrderRepository } from '../domain/order/order.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';
import { OrderedProductInterface } from '../domain/order/ordered-product.interface';
import { OrderType } from '../domain/order/order-type';
import { ProductWithQuantity } from '../domain/product/product-with-quantity';

export class GetOrderedProductsByDateRange {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(user: User, startDate: Date, endDate: Date): Promise<OrderedProductInterface[]> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const orderedProducts: OrderedProductInterface[] = [];

    for (const date: Date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const foundOrders: OrderInterface[] = await this.orderRepository.findAllByDate(new Date(date));
      if (foundOrders) {
        foundOrders.forEach((order: OrderInterface) => this.countOrderedProducts(orderedProducts, order));
      }
    }

    return orderedProducts;
  }

  private countOrderedProducts(orderedProducts: OrderedProductInterface[], order: OrderInterface): void {
    order.products.forEach((productWithQuantity: ProductWithQuantity) => this.incrementCounts(orderedProducts, order.type, productWithQuantity));
  }

  private incrementCounts(orderedProducts: OrderedProductInterface[], orderType: OrderType, productWithQuantity: ProductWithQuantity): void {
    const orderedProduct: OrderedProductInterface = this.getOrderedProduct(orderedProducts, productWithQuantity.product.name);
    switch (orderType) {
      case OrderType.PICK_UP:
        orderedProduct.pickUpCount += productWithQuantity.quantity;
        break;
      case OrderType.DELIVERY:
        orderedProduct.deliveryCount += productWithQuantity.quantity;
        break;
      case OrderType.RESERVATION:
        orderedProduct.reservationCount += productWithQuantity.quantity;
        break;
    }
    orderedProduct.totalCount += productWithQuantity.quantity;
  }

  private getOrderedProduct(orderedProducts: OrderedProductInterface[], productName: string): OrderedProductInterface {
    const existingOrderedProduct: OrderedProductInterface = orderedProducts.find(
      (orderedProduct: OrderedProductInterface) => orderedProduct.name === productName
    );
    if (existingOrderedProduct) {
      return existingOrderedProduct;
    }

    const emptyOrderedProduct: OrderedProductInterface = this.buildEmptyOrderedProduct(productName);
    orderedProducts.push(emptyOrderedProduct);

    return emptyOrderedProduct;
  }

  private buildEmptyOrderedProduct(name: string): OrderedProductInterface {
    return { name, pickUpCount: 0, deliveryCount: 0, reservationCount: 0, totalCount: 0 };
  }
}
