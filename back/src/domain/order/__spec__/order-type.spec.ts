import { getOrderTypeLabel, OrderType } from '../order-type';

describe('domain/order/OrderType', () => {
  describe('getOrderTypeLabel()', () => {
    it('should return Cueillette when order type is PICK_UP', () => {
      // given
      const orderType: OrderType = OrderType.PICK_UP;

      // when
      const result: string = getOrderTypeLabel(orderType);

      // then
      expect(result).toBe('Cueillette');
    });

    it('should return Livraison when order type is DELIVERY', () => {
      // given
      const orderType: OrderType = OrderType.DELIVERY;

      // when
      const result: string = getOrderTypeLabel(orderType);

      // then
      expect(result).toBe('Livraison');
    });

    it('should return Réservation when order type is RESERVATION', () => {
      // given
      const orderType: OrderType = OrderType.RESERVATION;

      // when
      const result: string = getOrderTypeLabel(orderType);

      // then
      expect(result).toBe('Réservation');
    });
  });
});
