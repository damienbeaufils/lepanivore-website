import { OrderType } from '../../../domain/order/order-type';
import { ProductWithQuantity } from '../../../domain/product/product-with-quantity';
import { OrderId } from '../../../domain/type-aliases';

export interface GetOrderResponse {
  id: OrderId;
  clientName: string;
  clientPhoneNumber: string;
  clientEmailAddress: string;
  products: ProductWithQuantity[];
  type: OrderType;
  pickUpDate?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  reservationDate?: string;
  note?: string;
}
