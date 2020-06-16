import { ClosingPeriodInterface } from '../../closing-period/closing-period.interface';
import { ProductStatus } from '../../product/product-status';
import { ProductInterface } from '../../product/product.interface';
import { NewOrderCommand } from '../commands/new-order-command';
import { UpdateOrderCommand } from '../commands/update-order-command';
import { InvalidOrderError } from '../errors/invalid-order.error';
import { Order } from '../order';
import { OrderType } from '../order-type';
import { OrderInterface } from '../order.interface';

describe('domain/order/Order', () => {
  let activeProducts: ProductInterface[];
  let closingPeriods: ClosingPeriodInterface[];
  let realDateConstructor: DateConstructor;

  beforeAll(() => {
    realDateConstructor = Date;
  });

  beforeEach(() => {
    global.Date = realDateConstructor;

    activeProducts = [{ id: 42, name: 'fake product' } as ProductInterface];
    closingPeriods = [];
  });

  describe('factory', () => {
    describe('create()', () => {
      let newOrderCommand: NewOrderCommand;

      beforeEach(() => {
        newOrderCommand = {
          clientName: 'John Doe',
          clientPhoneNumber: '514-123-4567',
          clientEmailAddress: 'test@example.org',
          products: [{ productId: 42, quantity: 1 }],
          type: OrderType.DELIVERY,
          pickUpDate: new Date('2030-01-01T12:00:00Z'),
          deliveryAddress: 'Montréal',
          deliveryDate: new Date('2030-01-10T12:00:00Z'),
          note: 'a note',
        };
      });

      describe('id', () => {
        it('should initialize with no id', () => {
          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.id).toBeUndefined();
        });
      });

      describe('clientName', () => {
        it('should bind client name from command', () => {
          // given
          newOrderCommand.clientName = 'Harry Potter';

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.clientName).toBe('Harry Potter');
        });

        it('should fail when client name is empty', () => {
          // given
          newOrderCommand.clientName = '';

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('client name has to be defined'));
        });
      });

      describe('clientPhoneNumber', () => {
        it('should bind client phone number from command', () => {
          // given
          newOrderCommand.clientPhoneNumber = '+1-514-987-6543';

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.clientPhoneNumber).toBe('+1-514-987-6543');
        });

        it('should fail when client phone number is empty', () => {
          // given
          newOrderCommand.clientPhoneNumber = '';

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('client phone number has to be defined'));
        });
      });

      describe('clientEmailAddress', () => {
        it('should bind client email address from command', () => {
          // given
          newOrderCommand.clientEmailAddress = 'test@example.org';

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.clientEmailAddress).toBe('test@example.org');
        });

        it('should fail when client email address is empty', () => {
          // given
          newOrderCommand.clientEmailAddress = '';

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('client email address has to be defined'));
        });

        it('should fail when client email address is not a valid email', () => {
          // given
          newOrderCommand.clientEmailAddress = 'not-a-valid-email';

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('invalid client email address not-a-valid-email'));
        });
      });

      describe('products', () => {
        it('should bind products using product ids from command and all products list', () => {
          // given
          newOrderCommand.products = [
            { productId: 42, quantity: 1 },
            { productId: 1337, quantity: 2 },
          ];

          const product1: ProductInterface = { id: 42, name: 'Product 1' } as ProductInterface;
          const product2: ProductInterface = { id: 1337, name: 'Product 2' } as ProductInterface;
          activeProducts = [product1, product2];

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.products).toStrictEqual([
            { product: product1, quantity: 1 },
            { product: product2, quantity: 2 },
          ]);
        });

        it('should fail when product list is empty', () => {
          // given
          newOrderCommand.products = [];

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('an order must have at least one product'));
        });

        it('should fail when having a product with zero quantity', () => {
          // given
          newOrderCommand.products = [
            { productId: 42, quantity: 0 },
            { productId: 1337, quantity: 2 },
          ];

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('product quantity 0 has to be positive'));
        });

        it('should fail when having a product with negative quantity', () => {
          // given
          newOrderCommand.products = [
            { productId: 42, quantity: 1 },
            { productId: 1337, quantity: -1 },
          ];

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('product quantity -1 has to be positive'));
        });

        it('should fail when having an unknown product id', () => {
          // given
          newOrderCommand.products = [
            { productId: 42, quantity: 1 },
            { productId: 1337, quantity: 2 },
          ];

          const product1: ProductInterface = { id: 42, name: 'Product 1' } as ProductInterface;
          activeProducts = [product1];

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('product with id 1337 not found'));
        });
      });

      describe('type', () => {
        it('should bind type from command', () => {
          // given
          newOrderCommand.type = OrderType.DELIVERY;

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.type).toBe(OrderType.DELIVERY);
        });

        it('should fail when no type', () => {
          // given
          newOrderCommand.type = undefined;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('order type has to be defined'));
        });

        it('should fail when unknown type', () => {
          // given
          newOrderCommand.type = 'UNKNOWN_TYPE' as OrderType;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('unknown order type UNKNOWN_TYPE'));
        });
      });

      describe('pickUpDate', () => {
        let now: Date;
        let nowMinusOneDay: Date;
        let aSundayInTheFuture: Date;
        let aMondayInTheFuture: Date;
        let aTuesdayInTheFuture: Date;
        let aWednesdayInTheFuture: Date;
        let aThursdayInTheFuture: Date;
        let aFridayInTheFuture: Date;
        let aSaturdayInTheFuture: Date;
        let aTuesdayInTheFutureTheWeekAfter: Date;

        beforeEach(() => {
          now = new Date('2020-06-03T04:41:20');
          nowMinusOneDay = new Date('2020-06-02T04:41:20');
          aSundayInTheFuture = new Date('2030-03-31T04:41:20');
          aMondayInTheFuture = new Date('2030-04-01T05:41:20');
          aTuesdayInTheFuture = new Date('2030-04-02T06:41:20');
          aWednesdayInTheFuture = new Date('2030-04-03T07:41:20');
          aThursdayInTheFuture = new Date('2030-04-04T08:41:20');
          aFridayInTheFuture = new Date('2030-04-05T09:41:20');
          aSaturdayInTheFuture = new Date('2030-04-06T10:41:20');
          aTuesdayInTheFutureTheWeekAfter = new Date('2030-04-09T06:41:20');
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => now);

          newOrderCommand.type = OrderType.PICK_UP;
        });

        it('should bind pick-up date from command', () => {
          // given
          newOrderCommand.pickUpDate = aTuesdayInTheFuture;

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.pickUpDate).toBe(aTuesdayInTheFuture);
        });

        it('should not bind any pick-up date from command when order type is delivery', () => {
          // given
          newOrderCommand.pickUpDate = aTuesdayInTheFuture;
          newOrderCommand.type = OrderType.DELIVERY;

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.pickUpDate).toBeNull();
        });

        it('should fail when no pick-up date and order type is pick-up', () => {
          // given
          newOrderCommand.pickUpDate = null;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('a pick-up date has to be defined when order type is pick-up'));
        });

        it('should fail when pick-up date is in the past', () => {
          // given
          newOrderCommand.pickUpDate = nowMinusOneDay;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('pick-up date 2020-06-02T08:41:20.000Z has to be in the future'));
        });

        it('should fail when pick-up date is a Sunday', () => {
          // given
          newOrderCommand.pickUpDate = aSundayInTheFuture;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('pick-up date 2030-03-31T08:41:20.000Z has to be between a Tuesday and a Saturday'));
        });

        it('should fail when pick-up date is a Monday', () => {
          // given
          newOrderCommand.pickUpDate = aMondayInTheFuture;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-01T09:41:20.000Z has to be between a Tuesday and a Saturday'));
        });

        it('should fail when pick-up date is in a closing period', () => {
          // given
          closingPeriods = [
            { startDate: nowMinusOneDay, endDate: aSundayInTheFuture } as ClosingPeriodInterface,
            { startDate: aMondayInTheFuture, endDate: aWednesdayInTheFuture } as ClosingPeriodInterface,
          ];
          newOrderCommand.pickUpDate = aTuesdayInTheFuture;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-02T10:41:20.000Z has to be outside closing periods'));
        });

        it('should not fail when pick-up date is outside closing periods', () => {
          // given
          closingPeriods = [
            { startDate: nowMinusOneDay, endDate: aSundayInTheFuture } as ClosingPeriodInterface,
            { startDate: aMondayInTheFuture, endDate: aWednesdayInTheFuture } as ClosingPeriodInterface,
          ];
          newOrderCommand.pickUpDate = aThursdayInTheFuture;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });

        describe('when ordering a Sunday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aSundayInTheFuture);
          });

          it('should not fail when pick-up date is the following Tuesday', () => {
            // given
            newOrderCommand.pickUpDate = aTuesdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });

        describe('when ordering a Monday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aMondayInTheFuture);
          });

          it('should fail when pick-up date is the following Tuesday', () => {
            // given
            newOrderCommand.pickUpDate = aTuesdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-02T10:41:20.000Z has to be at least 3 days after now'));
          });

          it('should fail when pick-up date is the following Wednesday', () => {
            // given
            newOrderCommand.pickUpDate = aWednesdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-03T11:41:20.000Z has to be at least 3 days after now'));
          });

          it('should not fail when pick-up date is the following Thursday', () => {
            // given
            newOrderCommand.pickUpDate = aThursdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });

        describe('when ordering a Tuesday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aTuesdayInTheFuture);
          });

          it('should fail when pick-up date is the same Tuesday', () => {
            // given
            newOrderCommand.pickUpDate = aTuesdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-02T10:41:20.000Z cannot be same day as now'));
          });

          it('should fail when pick-up date is the following Wednesday', () => {
            // given
            newOrderCommand.pickUpDate = aWednesdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-03T11:41:20.000Z has to be at least 2 days after now'));
          });

          it('should not fail when pick-up date is the following Thursday', () => {
            // given
            newOrderCommand.pickUpDate = aThursdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });

        describe('when ordering a Wednesday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aWednesdayInTheFuture);
          });

          it('should fail when pick-up date is the same Wednesday', () => {
            // given
            newOrderCommand.pickUpDate = aWednesdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-03T11:41:20.000Z cannot be same day as now'));
          });

          it('should fail when pick-up date is the following Thursday', () => {
            // given
            newOrderCommand.pickUpDate = aThursdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-04T12:41:20.000Z has to be at least 3 days after now'));
          });

          it('should fail when pick-up date is the following Friday', () => {
            // given
            newOrderCommand.pickUpDate = aFridayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-05T13:41:20.000Z has to be at least 3 days after now'));
          });

          it('should not fail when pick-up date is the following Saturday', () => {
            // given
            newOrderCommand.pickUpDate = aSaturdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });

        describe('when ordering a Thursday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aThursdayInTheFuture);
          });

          it('should fail when pick-up date is the same Thursday', () => {
            // given
            newOrderCommand.pickUpDate = aThursdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-04T12:41:20.000Z cannot be same day as now'));
          });

          it('should fail when pick-up date is the following Friday', () => {
            // given
            newOrderCommand.pickUpDate = aFridayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-05T13:41:20.000Z has to be at least 2 days after now'));
          });

          it('should not fail when pick-up date is the following Saturday', () => {
            // given
            newOrderCommand.pickUpDate = aSaturdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });

        describe('when ordering a Friday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aFridayInTheFuture);
          });

          it('should fail when pick-up date is the same Friday', () => {
            // given
            newOrderCommand.pickUpDate = aFridayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-05T13:41:20.000Z cannot be same day as now'));
          });

          it('should fail when pick-up date is the following Saturday', () => {
            // given
            newOrderCommand.pickUpDate = aSaturdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-06T14:41:20.000Z has to be at least 3 days after now'));
          });

          it('should not fail when pick-up date is the following Tuesday', () => {
            // given
            newOrderCommand.pickUpDate = aTuesdayInTheFutureTheWeekAfter;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });

        describe('when ordering a Saturday', () => {
          beforeEach(() => {
            // @ts-ignore
            jest.spyOn(global, 'Date').mockImplementation(() => aSaturdayInTheFuture);
          });

          it('should fail when pick-up date is the same Saturday', () => {
            // given
            newOrderCommand.pickUpDate = aSaturdayInTheFuture;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-06T14:41:20.000Z cannot be same day as now'));
          });

          it('should not fail when pick-up date is the following Tuesday', () => {
            // given
            newOrderCommand.pickUpDate = aTuesdayInTheFutureTheWeekAfter;

            // when
            const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

            // then
            expect(result).not.toThrow();
          });
        });
      });

      describe('deliveryAddress', () => {
        beforeEach(() => {
          newOrderCommand.type = OrderType.DELIVERY;
        });

        it('should bind delivery address from command', () => {
          // given
          newOrderCommand.deliveryAddress = '1224 Rue Bélanger, Montréal, QC H2S 1H8';

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.deliveryAddress).toBe('1224 Rue Bélanger, Montréal, QC H2S 1H8');
        });

        it('should not bind any delivery address from command when order type is pick-up', () => {
          // given
          newOrderCommand.deliveryAddress = '1224 Rue Bélanger, Montréal, QC H2S 1H8';
          newOrderCommand.type = OrderType.PICK_UP;

          const now: Date = new Date('2020-06-03T04:41:20');
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => now);

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.deliveryAddress).toBeNull();
        });

        it('should fail when delivery address is empty and order type is delivery', () => {
          // given
          newOrderCommand.deliveryAddress = '';

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('a delivery address has to be defined when order type is delivery'));
        });
      });

      describe('deliveryDate', () => {
        let now: Date;
        let nowMinusOneDay: Date;
        let tuesdayBeforeSevenPM: Date;
        let tuesdayAtSevenPM: Date;
        let wednesdayAfterTuesday: Date;
        let firstThursdayAfterTuesday: Date;
        let secondThursdayAfterTuesday: Date;
        let thirdThursdayAfterTuesday: Date;

        beforeEach(() => {
          now = new Date('2020-06-03T04:41:20');
          nowMinusOneDay = new Date('2020-06-02T04:41:20');
          tuesdayBeforeSevenPM = new Date('2020-06-09T18:59:59');
          tuesdayAtSevenPM = new Date('2020-06-09T19:00:00');
          wednesdayAfterTuesday = new Date('2020-06-10T19:00:00');
          firstThursdayAfterTuesday = new Date('2020-06-11T19:00:00');
          secondThursdayAfterTuesday = new Date('2020-06-18T19:00:00');
          thirdThursdayAfterTuesday = new Date('2020-06-25T19:00:00');
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => now);

          newOrderCommand.type = OrderType.DELIVERY;
        });

        it('should bind delivery date from command', () => {
          // given
          newOrderCommand.deliveryDate = secondThursdayAfterTuesday;

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.deliveryDate).toBe(secondThursdayAfterTuesday);
        });

        it('should not bind any delivery date from command when order type is pick-up', () => {
          // given
          newOrderCommand.deliveryDate = new Date('2020-06-05T04:41:20');
          newOrderCommand.type = OrderType.PICK_UP;

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.deliveryDate).toBeNull();
        });

        it('should fail when delivery date is empty and order type is delivery', () => {
          // given
          newOrderCommand.deliveryDate = undefined;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('a delivery date has to be defined when order type is delivery'));
        });

        it('should fail when delivery date is in the past', () => {
          // given
          newOrderCommand.deliveryDate = nowMinusOneDay;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-02T08:41:20.000Z has to be in the future'));
        });

        it('should fail when delivery date is during a closing period', () => {
          // given
          closingPeriods = [
            {
              startDate: tuesdayBeforeSevenPM,
              endDate: secondThursdayAfterTuesday,
            } as ClosingPeriodInterface,
          ];
          newOrderCommand.deliveryDate = firstThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => tuesdayBeforeSevenPM);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-11T23:00:00.000Z has to be outside closing periods'));
        });

        it('should not fail when delivery date is outside a closing period', () => {
          // given
          closingPeriods = [
            {
              startDate: tuesdayBeforeSevenPM,
              endDate: secondThursdayAfterTuesday,
            } as ClosingPeriodInterface,
          ];
          newOrderCommand.deliveryDate = thirdThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => tuesdayBeforeSevenPM);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });

        it('should fail when delivery date is not a Thursday', () => {
          // given
          newOrderCommand.deliveryDate = wednesdayAfterTuesday;

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-10T23:00:00.000Z has to be a Thursday'));
        });

        it('should not fail when delivery date is the Thursday same week as now when creating the order before Tuesday 7 PM', () => {
          // given
          newOrderCommand.deliveryDate = firstThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => tuesdayBeforeSevenPM);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });

        it('should fail when delivery date is the Thursday same week as now when creating the order Tuesday after 7 PM', () => {
          // given
          newOrderCommand.deliveryDate = firstThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => tuesdayAtSevenPM);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-11T23:00:00.000Z has to be one of the next available Thursday'));
        });

        it('should not fail when delivery date is the Thursday the week after now when creating the order Tuesday after 7 PM', () => {
          // given
          newOrderCommand.deliveryDate = secondThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => tuesdayAtSevenPM);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });

        it('should fail when delivery date is the Thursday same week as now when creating the order Wednesday', () => {
          // given
          newOrderCommand.deliveryDate = firstThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => wednesdayAfterTuesday);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-11T23:00:00.000Z has to be one of the next available Thursday'));
        });

        it('should not fail when delivery date is the Thursday the week after now when creating the order Wednesday', () => {
          // given
          newOrderCommand.deliveryDate = secondThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => wednesdayAfterTuesday);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });

        it('should fail when delivery date is the Thursday same week as now when creating the order Thursday', () => {
          // given
          newOrderCommand.deliveryDate = firstThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => firstThursdayAfterTuesday);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-11T23:00:00.000Z has to be one of the next available Thursday'));
        });

        it('should not fail when delivery date is the Thursday the week after now when creating the order Thursday', () => {
          // given
          newOrderCommand.deliveryDate = secondThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => firstThursdayAfterTuesday);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });

        it('should not fail when delivery date is the Thursday the week after now when creating the order Thursday and there is less than 7 days in milliseconds between dates', () => {
          // given
          secondThursdayAfterTuesday.setHours(1, 1, 1, 1);
          newOrderCommand.deliveryDate = secondThursdayAfterTuesday;
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => firstThursdayAfterTuesday);

          // when
          const result = () => Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result).not.toThrow();
        });
      });

      describe('note', () => {
        it('should bind note from command', () => {
          // given
          newOrderCommand.note = 'Without something please';

          // when
          const result: Order = Order.factory.create(newOrderCommand, activeProducts, closingPeriods);

          // then
          expect(result.note).toBe('Without something please');
        });
      });
    });

    describe('copy()', () => {
      it('should create a new instance as a copy of given order', () => {
        // given
        const orderToCopy: OrderInterface = {
          id: 42,
          clientName: 'John Doe',
          clientPhoneNumber: '+1 514 111 1111',
          clientEmailAddress: 'test@example.org',
          products: [
            {
              product: {
                id: 1,
                name: 'product 1',
                description: 'product 1 description',
                price: 1.11,
                status: ProductStatus.ACTIVE,
              },
              quantity: 1,
            },
            {
              product: {
                id: 2,
                name: 'product 2',
                description: 'product 2 description',
                price: 2.22,
                status: ProductStatus.ARCHIVED,
              },
              quantity: 2,
            },
          ],
          type: OrderType.PICK_UP,
          pickUpDate: new Date('2020-06-13T04:41:20'),
          deliveryAddress: 'Montréal',
          deliveryDate: new Date('2030-06-13T04:41:20'),
          note: 'a note',
        };

        // when
        const result: Order = Order.factory.copy(orderToCopy);

        // then
        expect(result).toMatchObject(orderToCopy);
        expect(result.updateWith).toBeDefined();
      });
    });
  });

  describe('updateWith()', () => {
    let existingOrder: Order;
    let updateOrderCommand: UpdateOrderCommand;

    beforeEach(() => {
      existingOrder = Order.factory.copy({
        id: 42,
        clientName: 'John Doe',
        clientPhoneNumber: '+1 514 111 1111',
        clientEmailAddress: 'test@example.org',
        products: [
          {
            product: { id: 9998, name: 'product 9998', price: 99.98 } as ProductInterface,
            quantity: 98,
          },
          {
            product: { id: 9999, name: 'product 9999', price: 99.99 } as ProductInterface,
            quantity: 99,
          },
        ],
        type: OrderType.PICK_UP,
        pickUpDate: new Date('2020-06-13T04:41:20'),
        deliveryAddress: 'Montréal',
        deliveryDate: new Date('2020-01-09T12:00:00Z'),
        note: 'a note',
      });

      updateOrderCommand = {
        orderId: 42,
        products: [{ productId: 42, quantity: 1 }],
        type: OrderType.DELIVERY,
        pickUpDate: new Date('2021-06-12T04:41:20'),
        deliveryAddress: 'Laval',
        deliveryDate: new Date('2030-01-10T12:00:00Z'),
        note: 'an updated note',
      };
    });

    describe('id', () => {
      it('should fail when existing order id does not match order id in command', () => {
        // given
        updateOrderCommand.orderId = 1337;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('existing order id 42 does not match command order id 1337'));
      });
    });

    describe('clientName', () => {
      it('should not change existing client name value', () => {
        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.clientName).toBe('John Doe');
      });
    });

    describe('clientPhoneNumber', () => {
      it('should not change existing client phone number value', () => {
        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.clientPhoneNumber).toBe('+1 514 111 1111');
      });
    });

    describe('clientEmailAddress', () => {
      it('should not change existing client email address value', () => {
        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.clientEmailAddress).toBe('test@example.org');
      });
    });

    describe('products', () => {
      it('should bind products using product ids from command and all products list', () => {
        // given
        updateOrderCommand.products = [
          { productId: 42, quantity: 1 },
          { productId: 1337, quantity: 2 },
        ];

        const product1: ProductInterface = { id: 42, name: 'Product 1' } as ProductInterface;
        const product2: ProductInterface = { id: 1337, name: 'Product 2' } as ProductInterface;
        activeProducts = [product1, product2];

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.products).toStrictEqual([
          { product: product1, quantity: 1 },
          { product: product2, quantity: 2 },
        ]);
      });

      it('should fail when product list is empty', () => {
        // given
        updateOrderCommand.products = [];

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('an order must have at least one product'));
      });

      it('should fail when having a product with zero quantity', () => {
        // given
        updateOrderCommand.products = [
          { productId: 42, quantity: 0 },
          { productId: 1337, quantity: 2 },
        ];

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('product quantity 0 has to be positive'));
      });

      it('should fail when having a product with negative quantity', () => {
        // given
        updateOrderCommand.products = [
          { productId: 42, quantity: 1 },
          { productId: 1337, quantity: -1 },
        ];

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('product quantity -1 has to be positive'));
      });

      it('should fail when having an unknown product id', () => {
        // given
        updateOrderCommand.products = [
          { productId: 42, quantity: 1 },
          { productId: 1337, quantity: 2 },
        ];

        const product1: ProductInterface = { id: 42, name: 'Product 1' } as ProductInterface;
        activeProducts = [product1];

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('product with id 1337 not found'));
      });
    });

    describe('type', () => {
      it('should bind type from command', () => {
        // given
        updateOrderCommand.type = OrderType.DELIVERY;

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.type).toBe(OrderType.DELIVERY);
      });

      it('should fail when no type', () => {
        // given
        updateOrderCommand.type = undefined;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('order type has to be defined'));
      });

      it('should fail when unknown type', () => {
        // given
        updateOrderCommand.type = 'UNKNOWN_TYPE' as OrderType;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('unknown order type UNKNOWN_TYPE'));
      });
    });

    describe('pickUpDate', () => {
      let now: Date;
      let nowMinusOneDay: Date;
      let nowMinusOneHour: Date;
      let aSundayInTheFuture: Date;
      let aMondayInTheFuture: Date;
      let aTuesdayInTheFuture: Date;
      let aWednesdayInTheFuture: Date;
      let aThursdayInTheFuture: Date;

      beforeEach(() => {
        now = new Date('2020-06-03T04:41:20');
        nowMinusOneDay = new Date('2020-06-02T04:41:20');
        nowMinusOneHour = new Date('2020-06-04T06:41:20');
        aSundayInTheFuture = new Date('2030-03-31T04:41:20');
        aMondayInTheFuture = new Date('2030-04-01T05:41:20');
        aTuesdayInTheFuture = new Date('2030-04-02T06:41:20');
        aWednesdayInTheFuture = new Date('2030-04-03T07:41:20');
        aThursdayInTheFuture = new Date('2030-04-04T08:41:20');
        // @ts-ignore
        jest.spyOn(global, 'Date').mockImplementation(() => now);

        updateOrderCommand.type = OrderType.PICK_UP;
      });

      it('should bind pick-up date from command', () => {
        // given
        updateOrderCommand.pickUpDate = aTuesdayInTheFuture;

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.pickUpDate).toBe(aTuesdayInTheFuture);
      });

      it('should not bind any pick-up date from command when order type is delivery', () => {
        // given
        updateOrderCommand.pickUpDate = aTuesdayInTheFuture;
        updateOrderCommand.type = OrderType.DELIVERY;

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.pickUpDate).toBeNull();
      });

      it('should fail when no pick-up date and order type is pick-up', () => {
        // given
        updateOrderCommand.pickUpDate = null;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('a pick-up date has to be defined when order type is pick-up'));
      });

      it('should fail when pick-up date is in the past', () => {
        // given
        updateOrderCommand.pickUpDate = nowMinusOneDay;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('pick-up date 2020-06-02T08:41:20.000Z has to be in the future'));
      });

      it('should not fail when pick-up date is in the past but at same date and different time', () => {
        // given
        updateOrderCommand.pickUpDate = nowMinusOneHour;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).not.toThrow();
      });

      it('should fail when pick-up date is a Sunday', () => {
        // given
        updateOrderCommand.pickUpDate = aSundayInTheFuture;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('pick-up date 2030-03-31T08:41:20.000Z has to be between a Tuesday and a Saturday'));
      });

      it('should fail when pick-up date is a Monday', () => {
        // given
        updateOrderCommand.pickUpDate = aMondayInTheFuture;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-01T09:41:20.000Z has to be between a Tuesday and a Saturday'));
      });

      it('should fail when pick-up date is in a closing period', () => {
        // given
        closingPeriods = [
          { startDate: nowMinusOneDay, endDate: aSundayInTheFuture } as ClosingPeriodInterface,
          { startDate: aMondayInTheFuture, endDate: aWednesdayInTheFuture } as ClosingPeriodInterface,
        ];
        updateOrderCommand.pickUpDate = aTuesdayInTheFuture;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('pick-up date 2030-04-02T10:41:20.000Z has to be outside closing periods'));
      });

      it('should not fail when pick-up date is outside closing periods', () => {
        // given
        closingPeriods = [
          { startDate: nowMinusOneDay, endDate: aSundayInTheFuture } as ClosingPeriodInterface,
          { startDate: aMondayInTheFuture, endDate: aWednesdayInTheFuture } as ClosingPeriodInterface,
        ];
        updateOrderCommand.pickUpDate = aThursdayInTheFuture;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).not.toThrow();
      });
    });

    describe('deliveryAddress', () => {
      beforeEach(() => {
        updateOrderCommand.type = OrderType.DELIVERY;
      });

      it('should bind delivery address from command', () => {
        // given
        updateOrderCommand.deliveryAddress = '1224 Rue Bélanger, Montréal, QC H2S 1H8';

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.deliveryAddress).toBe('1224 Rue Bélanger, Montréal, QC H2S 1H8');
      });

      it('should not bind any delivery address from command when order type is pick-up', () => {
        // given
        updateOrderCommand.deliveryAddress = '1224 Rue Bélanger, Montréal, QC H2S 1H8';
        updateOrderCommand.type = OrderType.PICK_UP;

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.deliveryAddress).toBeNull();
      });

      it('should fail when delivery address is empty and order type is delivery', () => {
        // given
        updateOrderCommand.deliveryAddress = '';

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('a delivery address has to be defined when order type is delivery'));
      });
    });

    describe('deliveryDate', () => {
      let now: Date;
      let nowMinusOneDay: Date;
      let nowMinusOneHour: Date;
      let tuesdayBeforeSevenPM: Date;
      let tuesdayAtSevenPM: Date;
      let wednesdayAfterTuesday: Date;
      let firstThursdayAfterTuesday: Date;
      let secondThursdayAfterTuesday: Date;
      let thirdThursdayAfterTuesday: Date;

      beforeEach(() => {
        now = new Date('2020-06-03T04:41:20');
        nowMinusOneDay = new Date('2020-06-02T04:41:20');
        nowMinusOneHour = new Date('2020-06-04T06:41:20');
        tuesdayBeforeSevenPM = new Date('2020-06-09T18:59:59');
        tuesdayAtSevenPM = new Date('2020-06-09T19:00:00');
        wednesdayAfterTuesday = new Date('2020-06-10T19:00:00');
        firstThursdayAfterTuesday = new Date('2020-06-11T19:00:00');
        secondThursdayAfterTuesday = new Date('2020-06-18T19:00:00');
        thirdThursdayAfterTuesday = new Date('2020-06-25T19:00:00');
        // @ts-ignore
        jest.spyOn(global, 'Date').mockImplementation(() => now);

        updateOrderCommand.type = OrderType.DELIVERY;
      });

      it('should bind delivery date from command', () => {
        // given
        updateOrderCommand.deliveryDate = secondThursdayAfterTuesday;

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.deliveryDate).toBe(secondThursdayAfterTuesday);
      });

      it('should not bind any delivery date from command when order type is pick-up', () => {
        // given
        updateOrderCommand.deliveryDate = new Date('2020-06-05T04:41:20');
        updateOrderCommand.type = OrderType.PICK_UP;

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.deliveryDate).toBeNull();
      });

      it('should fail when delivery date is empty and order type is delivery', () => {
        // given
        updateOrderCommand.deliveryDate = undefined;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('a delivery date has to be defined when order type is delivery'));
      });

      it('should fail when delivery date is in the past', () => {
        // given
        updateOrderCommand.deliveryDate = nowMinusOneDay;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-02T08:41:20.000Z has to be in the future'));
      });

      it('should not fail when delivery date is in the past but at same date and different time', () => {
        // given
        updateOrderCommand.deliveryDate = nowMinusOneHour;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).not.toThrow();
      });

      it('should fail when delivery date is during a closing period', () => {
        // given
        closingPeriods = [
          {
            startDate: tuesdayBeforeSevenPM,
            endDate: secondThursdayAfterTuesday,
          } as ClosingPeriodInterface,
        ];
        updateOrderCommand.deliveryDate = firstThursdayAfterTuesday;
        // @ts-ignore
        jest.spyOn(global, 'Date').mockImplementation(() => tuesdayBeforeSevenPM);

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-11T23:00:00.000Z has to be outside closing periods'));
      });

      it('should not fail when delivery date is outside a closing period', () => {
        // given
        closingPeriods = [
          {
            startDate: tuesdayBeforeSevenPM,
            endDate: secondThursdayAfterTuesday,
          } as ClosingPeriodInterface,
        ];
        updateOrderCommand.deliveryDate = thirdThursdayAfterTuesday;
        // @ts-ignore
        jest.spyOn(global, 'Date').mockImplementation(() => tuesdayBeforeSevenPM);

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).not.toThrow();
      });

      it('should fail when delivery date is not a Thursday', () => {
        // given
        updateOrderCommand.deliveryDate = wednesdayAfterTuesday;

        // when
        const result = () => existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(result).toThrow(new InvalidOrderError('delivery date 2020-06-10T23:00:00.000Z has to be a Thursday'));
      });
    });

    describe('note', () => {
      it('should bind note from command', () => {
        // given
        updateOrderCommand.note = 'a new note';

        // when
        existingOrder.updateWith(updateOrderCommand, activeProducts, closingPeriods);

        // then
        expect(existingOrder.note).toBe('a new note');
      });
    });
  });
});
