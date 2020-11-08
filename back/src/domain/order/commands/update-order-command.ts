import { ProductIdWithQuantity } from '../../product/product-with-quantity';
import { OrderId } from '../../type-aliases';
import { OrderType } from '../order-type';

export interface UpdateOrderCommand {
  orderId: OrderId;
  products: ProductIdWithQuantity[];
  type: OrderType;
  pickUpDate?: Date;
  deliveryDate?: Date;
  deliveryAddress?: string;
  reservationDate?: Date;
  note?: string;
}
