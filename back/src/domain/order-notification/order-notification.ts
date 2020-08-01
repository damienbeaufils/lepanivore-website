import { isEmpty } from 'lodash';
import * as os from 'os';
import { getDateAsIsoStringWithoutTime } from '../date.utils';
import { getOrderTypeLabel, OrderType } from '../order/order-type';
import { OrderInterface } from '../order/order.interface';
import { ProductWithQuantity } from '../product/product-with-quantity';
import { OrderNotificationInterface } from './order-notification.interface';

export class OrderNotification implements OrderNotificationInterface {
  static factory: OrderNotificationFactoryInterface = {
    create(order: OrderInterface): OrderNotification {
      return new OrderNotification(order);
    },
  };

  subject: string;
  body: string;

  private constructor(order: OrderInterface) {
    this.subject = `Nouvelle commande en ligne: #${order.id}`;
    this.body = OrderNotification.buildBody(order);
  }

  private static buildBody(order: OrderInterface): string {
    const heading: string = `Bonjour,${os.EOL}${os.EOL}Une nouvelle commande (#${order.id}) a été passée en ligne !`;

    const clientHeadline: string = 'Informations de contact :';
    const clientName: string = `- Nom du client : ${order.clientName}`;
    const clientPhoneNumber: string = `- Numéro de téléphone du client : ${order.clientPhoneNumber}`;
    const clientEmailAddress: string = `- Courriel du client : ${order.clientEmailAddress}`;

    const orderId: string = `- Numéro de commande : #${order.id}`;
    const orderType: string = `- Type de commande : ${getOrderTypeLabel(order.type)}`;
    const orderTypeDetails: string =
      order.type === OrderType.DELIVERY
        ? `- Date de livraison : ${getDateAsIsoStringWithoutTime(order.deliveryDate)}${os.EOL}- Adresse de livraison : ${order.deliveryAddress}`
        : `- Date de cueillette : ${getDateAsIsoStringWithoutTime(order.pickUpDate)}`;
    const products: string =
      `- Produits :${os.EOL}` +
      order.products
        .map((productWithQuantity: ProductWithQuantity) => {
          return `  - ${productWithQuantity.product.name} : ${productWithQuantity.quantity}`;
        })
        .join(os.EOL);
    const note: string = `- Note : ${isEmpty(order.note) ? 'N/A' : order.note}`;

    return `${heading}${os.EOL}${os.EOL}${clientHeadline}${os.EOL}${clientName}${os.EOL}${clientPhoneNumber}${os.EOL}${clientEmailAddress}${os.EOL}${os.EOL}${orderId}${os.EOL}${orderType}${os.EOL}${orderTypeDetails}${os.EOL}${products}${os.EOL}${note}`;
  }
}

export interface OrderNotificationFactoryInterface {
  create(order: OrderInterface): OrderNotification;
}
