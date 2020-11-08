import { ProductIdWithQuantity } from '../../product/product-with-quantity';
import { OrderType } from '../order-type';

export interface NewOrderCommand {
  clientName: string;
  clientPhoneNumber: string;
  clientEmailAddress: string;
  products: ProductIdWithQuantity[];
  type: OrderType;
  pickUpDate?: Date;
  deliveryDate?: Date;
  deliveryAddress?: string;
  reservationDate?: Date;
  note?: string;
}
