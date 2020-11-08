import { ProductIdWithQuantity } from '../../../domain/product/product-with-quantity';

export interface PostOrderRequest {
  clientName: string;
  clientPhoneNumber: string;
  clientEmailAddress: string;
  products: ProductIdWithQuantity[];
  type: string;
  pickUpDate?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  reservationDate?: string;
  note?: string;
}
