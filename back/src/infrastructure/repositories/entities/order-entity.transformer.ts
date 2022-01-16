import { Injectable } from '@nestjs/common';
import { ValueTransformer } from 'typeorm';
import { OrderType } from '../../../domain/order/order-type';
import { OrderInterface } from '../../../domain/order/order.interface';
import { Product } from '../../../domain/product/product';
import { ProductWithQuantity } from '../../../domain/product/product-with-quantity';
import { OrderEntity } from './order.entity';

@Injectable()
export class OrderEntityTransformer implements ValueTransformer {
  private readonly PRODUCT_WITH_QUANTITY_SEPARATOR: string = ':::';

  from(orderEntity: OrderEntity): OrderInterface {
    const products: ProductWithQuantity[] = orderEntity.products.map((productWithQuantityAsStringWithSeparator: string): ProductWithQuantity => {
      const productWithQuantityAsStringArray: string[] = productWithQuantityAsStringWithSeparator.split(this.PRODUCT_WITH_QUANTITY_SEPARATOR);

      return {
        product: JSON.parse(productWithQuantityAsStringArray[0]) as Product,
        quantity: parseInt(productWithQuantityAsStringArray[1], 10),
      };
    });

    return {
      id: orderEntity.id,
      clientName: orderEntity.clientName,
      clientPhoneNumber: orderEntity.clientPhoneNumber,
      clientEmailAddress: orderEntity.clientEmailAddress,
      products,
      type: orderEntity.type as OrderType,
      pickUpDate: orderEntity.pickUpDate,
      deliveryDate: orderEntity.deliveryDate,
      deliveryAddress: orderEntity.deliveryAddress,
      reservationDate: orderEntity.reservationDate,
      note: orderEntity.note,
      checked: orderEntity.checked,
    };
  }

  to(order: OrderInterface): OrderEntity {
    const orderEntity: OrderEntity = new OrderEntity();
    orderEntity.id = order.id;
    orderEntity.clientName = order.clientName;
    orderEntity.clientPhoneNumber = order.clientPhoneNumber;
    orderEntity.clientEmailAddress = order.clientEmailAddress;
    orderEntity.products = order.products.map(
      (productWithQuantity: ProductWithQuantity) =>
        `${JSON.stringify(productWithQuantity.product)}${this.PRODUCT_WITH_QUANTITY_SEPARATOR}${productWithQuantity.quantity}`
    );
    orderEntity.type = order.type;
    orderEntity.pickUpDate = order.pickUpDate;
    orderEntity.deliveryDate = order.deliveryDate;
    orderEntity.deliveryAddress = order.deliveryAddress;
    orderEntity.reservationDate = order.reservationDate;
    orderEntity.note = order.note;
    orderEntity.checked = order.checked;

    return orderEntity;
  }
}
