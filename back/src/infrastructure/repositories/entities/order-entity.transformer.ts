import { Injectable } from '@nestjs/common';
import { ValueTransformer } from 'typeorm';
import { OrderType } from '../../../domain/order/order-type';
import { OrderInterface } from '../../../domain/order/order.interface';
import { Product } from '../../../domain/product/product';
import { ProductWithQuantity } from '../../../domain/product/product-with-quantity';
import { EncryptionService } from '../../config/encryption/encryption.service';
import { OrderEntity } from './order.entity';

@Injectable()
export class OrderEntityTransformer implements ValueTransformer {
  private readonly PRODUCT_WITH_QUANTITY_SEPARATOR: string = ':::';

  constructor(private readonly encryptionService: EncryptionService) {}

  async from(orderEntity: OrderEntity): Promise<OrderInterface> {
    const products: ProductWithQuantity[] = orderEntity.products.map((productWithQuantityAsStringWithSeparator: string): ProductWithQuantity => {
      const productWithQuantityAsStringArray: string[] = productWithQuantityAsStringWithSeparator.split(this.PRODUCT_WITH_QUANTITY_SEPARATOR);

      return {
        product: JSON.parse(productWithQuantityAsStringArray[0]) as Product,
        quantity: parseInt(productWithQuantityAsStringArray[1], 10),
      };
    });

    const decryptedClientName: string = await this.encryptionService.decrypt(orderEntity.clientName);
    const decryptedClientPhoneNumber: string = await this.encryptionService.decrypt(orderEntity.clientPhoneNumber);
    const decryptedClientEmailAddress: string = await this.encryptionService.decrypt(orderEntity.clientEmailAddress);
    const decryptedDeliveryAddress: string = orderEntity.deliveryAddress
      ? await this.encryptionService.decrypt(orderEntity.deliveryAddress)
      : orderEntity.deliveryAddress;

    return Promise.resolve({
      id: orderEntity.id,
      clientName: decryptedClientName,
      clientPhoneNumber: decryptedClientPhoneNumber,
      clientEmailAddress: decryptedClientEmailAddress,
      products,
      type: orderEntity.type as OrderType,
      pickUpDate: orderEntity.pickUpDate,
      deliveryDate: orderEntity.deliveryDate,
      deliveryAddress: decryptedDeliveryAddress,
      reservationDate: orderEntity.reservationDate,
      note: orderEntity.note,
      checked: orderEntity.checked,
    });
  }

  async to(order: OrderInterface): Promise<OrderEntity> {
    const encryptedClientName: string = await this.encryptionService.encrypt(order.clientName);
    const encryptedClientPhoneNumber: string = await this.encryptionService.encrypt(order.clientPhoneNumber);
    const encryptedClientEmailAddress: string = await this.encryptionService.encrypt(order.clientEmailAddress);
    const encryptedDeliveryAddress: string = order.deliveryAddress
      ? await this.encryptionService.encrypt(order.deliveryAddress)
      : order.deliveryAddress;

    const orderEntity: OrderEntity = new OrderEntity();
    orderEntity.id = order.id;
    orderEntity.clientName = encryptedClientName;
    orderEntity.clientPhoneNumber = encryptedClientPhoneNumber;
    orderEntity.clientEmailAddress = encryptedClientEmailAddress;
    orderEntity.products = order.products.map(
      (productWithQuantity: ProductWithQuantity) =>
        `${JSON.stringify(productWithQuantity.product)}${this.PRODUCT_WITH_QUANTITY_SEPARATOR}${productWithQuantity.quantity}`
    );
    orderEntity.type = order.type;
    orderEntity.pickUpDate = order.pickUpDate;
    orderEntity.deliveryDate = order.deliveryDate;
    orderEntity.deliveryAddress = encryptedDeliveryAddress;
    orderEntity.reservationDate = order.reservationDate;
    orderEntity.note = order.note;
    orderEntity.checked = order.checked;

    return Promise.resolve(orderEntity);
  }
}
