import { ProductIdWithQuantity } from '../../../domain/product/product-with-quantity';

export interface PutOrderRequest {
  products: ProductIdWithQuantity[];
  type: string;
  pickUpDate?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  reservationDate?: string;
  note?: string;
}
