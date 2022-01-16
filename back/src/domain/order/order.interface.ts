import { ProductWithQuantity } from '../product/product-with-quantity';
import { OrderId } from '../type-aliases';
import { OrderType } from './order-type';

export interface OrderInterface {
  id: OrderId;
  clientName: string;
  clientPhoneNumber: string;
  clientEmailAddress: string;
  products: ProductWithQuantity[];
  type: OrderType;
  pickUpDate?: Date;
  deliveryDate?: Date;
  deliveryAddress?: string;
  reservationDate?: Date;
  note?: string;
  checked?: boolean;
}
