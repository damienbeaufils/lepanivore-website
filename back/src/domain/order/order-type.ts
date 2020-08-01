export enum OrderType {
  PICK_UP = 'PICK_UP',
  DELIVERY = 'DELIVERY',
  RESERVATION = 'RESERVATION',
}
export const getOrderTypeLabel = (orderType: OrderType): string => {
  switch (orderType) {
    case OrderType.PICK_UP:
      return 'Cueillette';
    case OrderType.DELIVERY:
      return 'Livraison';
    case OrderType.RESERVATION:
      return 'Réservation';
  }
};
