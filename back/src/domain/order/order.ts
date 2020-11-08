import { cloneDeep, isEmpty } from 'lodash';
import { ClosingPeriodInterface } from '../closing-period/closing-period.interface';
import { Day, NUMBER_OF_DAYS_IN_A_WEEK } from '../date.constants';
import {
  getCurrentDateAtCanadaEasternTimeZone,
  getNumberOfDaysBetweenFirstDateAndSecondDate,
  isFirstDateBeforeSecondDateIgnoringHours,
} from '../date.utils';
import { Product } from '../product/product';
import { ProductIdWithQuantity, ProductWithQuantity } from '../product/product-with-quantity';
import { ProductInterface } from '../product/product.interface';
import { OrderId } from '../type-aliases';
import { NewOrderCommand } from './commands/new-order-command';
import { UpdateOrderCommand } from './commands/update-order-command';
import { InvalidOrderError } from './errors/invalid-order.error';
import { DELIVERY_DAY, MAXIMUM_DAY_FOR_DELIVERY_SAME_WEEK, MAXIMUM_HOUR_FOR_DELIVERY_SAME_WEEK } from './order-delivery-constraints';
import {
  AVAILABLE_DAYS_FOR_A_PICK_UP_ORDER,
  AvailableDayForAPickUpOrder,
  CLOSING_DAYS,
  MAXIMUM_HOUR_TO_PLACE_A_PICK_UP_ORDER_BEFORE_BEING_CONSIDERED_AS_PLACED_THE_FOLLOWING_DAY,
} from './order-pick-up-constraints';
import { OrderType } from './order-type';
import { OrderInterface } from './order.interface';

export class Order implements OrderInterface {
  static factory: OrderFactoryInterface = {
    create(command: NewOrderCommand, activeProducts: ProductInterface[], closingPeriods: ClosingPeriodInterface[], isAdmin: boolean): Order {
      return new Order({} as OrderInterface, command, activeProducts, closingPeriods, isAdmin);
    },
    copy(order: OrderInterface): Order {
      return new Order(order, {} as NewOrderCommand, [], [], false);
    },
  };

  private static EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

  private constructor(
    order: OrderInterface,
    command: NewOrderCommand,
    activeProducts: ProductInterface[],
    closingPeriods: ClosingPeriodInterface[],
    isAdmin: boolean
  ) {
    if (!isEmpty(order)) {
      this.copy(order);
    } else {
      this.id = undefined;

      this.bindContactDetails(command);
      this.bindProductSelection(command, activeProducts);
      this.bindOrderTypeSelection(command, closingPeriods, isAdmin);
      this.note = command.note;

      if (!isAdmin) {
        Order.assertPickUpDateIsEqualOrAfterTheFirstAvailableDay(command.type, command.pickUpDate);
        Order.assertDeliveryDateIsEqualOrAfterTheFirstAvailableDay(command.type, command.deliveryDate);
      }
    }
  }

  private static assertClientNameIsValid(clientName: string): void {
    if (isEmpty(clientName)) {
      throw new InvalidOrderError('client name has to be defined');
    }
  }

  private static assertClientPhoneNumberIsValid(clientPhoneNumber: string): void {
    if (isEmpty(clientPhoneNumber)) {
      throw new InvalidOrderError('client phone number has to be defined');
    }
  }

  private static assertClientEmailAddressIsValid(clientEmailAddress: string): void {
    if (isEmpty(clientEmailAddress)) {
      throw new InvalidOrderError('client email address has to be defined');
    }
    if (!this.EMAIL_REGEX.test(clientEmailAddress)) {
      throw new InvalidOrderError(`invalid client email address ${clientEmailAddress}`);
    }
  }

  private static assertTypeIsValid(type: OrderType, isAdmin: boolean): void {
    if (isEmpty(type)) {
      throw new InvalidOrderError('order type has to be defined');
    }
    if (!Object.keys(OrderType).includes(type)) {
      throw new InvalidOrderError(`unknown order type ${type}`);
    }
    if (type === OrderType.RESERVATION && !isAdmin) {
      throw new InvalidOrderError('RESERVATION order type requires to be ADMIN');
    }
  }

  private static assertProductsAreValid(products: ProductIdWithQuantity[]): void {
    if (isEmpty(products)) {
      throw new InvalidOrderError('an order must have at least one product');
    }

    products.forEach((productWithQuantity: ProductIdWithQuantity) => {
      if (productWithQuantity.quantity < 1) {
        throw new InvalidOrderError(`product quantity ${productWithQuantity.quantity} has to be positive`);
      }
    });
  }

  private static assertPickUpDateIsValid(type: OrderType, closingPeriods: ClosingPeriodInterface[], pickUpDate?: Date): void {
    if (type === OrderType.PICK_UP) {
      if (!pickUpDate) {
        throw new InvalidOrderError('a pick-up date has to be defined when order type is pick-up');
      }

      const now: Date = getCurrentDateAtCanadaEasternTimeZone();
      if (isFirstDateBeforeSecondDateIgnoringHours(pickUpDate, now)) {
        throw new InvalidOrderError(`pick-up date ${pickUpDate.toISOString()} has to be in the future`);
      }

      if (CLOSING_DAYS.includes(pickUpDate.getDay())) {
        throw new InvalidOrderError(`pick-up date ${pickUpDate.toISOString()} has to be between a Tuesday and a Saturday`);
      }

      closingPeriods.forEach((closingPeriod: ClosingPeriodInterface) => {
        if (pickUpDate.getTime() >= closingPeriod.startDate.getTime() && pickUpDate.getTime() <= closingPeriod.endDate.getTime()) {
          throw new InvalidOrderError(`pick-up date ${pickUpDate.toISOString()} has to be outside closing periods`);
        }
      });
    }
  }

  private static assertPickUpDateIsEqualOrAfterTheFirstAvailableDay(type: OrderType, pickUpDate: Date): void {
    if (type === OrderType.PICK_UP) {
      const now: Date = getCurrentDateAtCanadaEasternTimeZone();
      if (now.getHours() >= MAXIMUM_HOUR_TO_PLACE_A_PICK_UP_ORDER_BEFORE_BEING_CONSIDERED_AS_PLACED_THE_FOLLOWING_DAY) {
        now.setDate(now.getDate() + 1);
      }

      const numberOfDaysBetweenNowAndPickUpDate: number = getNumberOfDaysBetweenFirstDateAndSecondDate(now, pickUpDate);
      const isPickUpDateInTheNextSixDays: boolean = numberOfDaysBetweenNowAndPickUpDate < NUMBER_OF_DAYS_IN_A_WEEK;

      const currentDay: number = now.getDay();
      if (isPickUpDateInTheNextSixDays && currentDay - pickUpDate.getDay() === 0) {
        throw new InvalidOrderError(`pick-up date ${pickUpDate.toISOString()} cannot be same day as now`);
      }

      const firstAvailableDay: Day = AVAILABLE_DAYS_FOR_A_PICK_UP_ORDER.filter(
        (availableDayForAPickUpOrder: AvailableDayForAPickUpOrder) => availableDayForAPickUpOrder.whenOrderIsPlacedOn === currentDay
      ).map((availableDayForAPickUpOrder: AvailableDayForAPickUpOrder) => availableDayForAPickUpOrder.firstAvailableDay)[0];
      const firstAvailableDate: Date = this.getNextDateHavingDay(firstAvailableDay);

      if (isFirstDateBeforeSecondDateIgnoringHours(pickUpDate, firstAvailableDate)) {
        const numberOfDaysBetweenNowAndFirstAvailableDate: number = getNumberOfDaysBetweenFirstDateAndSecondDate(now, firstAvailableDate);
        throw new InvalidOrderError(
          `pick-up date ${pickUpDate.toISOString()} has to be at least ${numberOfDaysBetweenNowAndFirstAvailableDate} days after now`
        );
      }
    }
  }

  private static assertDeliveryAddressIsValid(type: OrderType, deliveryAddress?: string): void {
    if (type === OrderType.DELIVERY && isEmpty(deliveryAddress)) {
      throw new InvalidOrderError('a delivery address has to be defined when order type is delivery');
    }
  }

  private static assertDeliveryDateIsValid(type: OrderType, closingPeriods: ClosingPeriodInterface[], deliveryDate?: Date): void {
    if (type === OrderType.DELIVERY) {
      if (!deliveryDate) {
        throw new InvalidOrderError('a delivery date has to be defined when order type is delivery');
      }

      const now: Date = getCurrentDateAtCanadaEasternTimeZone();
      if (isFirstDateBeforeSecondDateIgnoringHours(deliveryDate, now)) {
        throw new InvalidOrderError(`delivery date ${deliveryDate.toISOString()} has to be in the future`);
      }

      closingPeriods.forEach((closingPeriod: ClosingPeriodInterface) => {
        if (deliveryDate.getTime() >= closingPeriod.startDate.getTime() && deliveryDate.getTime() <= closingPeriod.endDate.getTime()) {
          throw new InvalidOrderError(`delivery date ${deliveryDate.toISOString()} has to be outside closing periods`);
        }
      });

      if (deliveryDate.getDay() !== DELIVERY_DAY) {
        throw new InvalidOrderError(`delivery date ${deliveryDate.toISOString()} has to be a Thursday`);
      }
    }
  }

  private static assertDeliveryDateIsEqualOrAfterTheFirstAvailableDay(type: OrderType, deliveryDate: Date): void {
    if (type === OrderType.DELIVERY) {
      const now: Date = getCurrentDateAtCanadaEasternTimeZone();
      const numberOfDaysBetweenNowAndDeliveryDate: number = getNumberOfDaysBetweenFirstDateAndSecondDate(now, deliveryDate);
      const isDeliveryDateInTheSameWeekAsNow: boolean =
        numberOfDaysBetweenNowAndDeliveryDate < NUMBER_OF_DAYS_IN_A_WEEK && now.getDay() <= deliveryDate.getDay();

      if (
        isDeliveryDateInTheSameWeekAsNow &&
        (now.getDay() > MAXIMUM_DAY_FOR_DELIVERY_SAME_WEEK ||
          (now.getDay() === MAXIMUM_DAY_FOR_DELIVERY_SAME_WEEK && now.getHours() >= MAXIMUM_HOUR_FOR_DELIVERY_SAME_WEEK))
      ) {
        throw new InvalidOrderError(`delivery date ${deliveryDate.toISOString()} has to be one of the next available Thursday`);
      }
    }
  }

  private static assertReservationDateIsValid(type: OrderType, closingPeriods: ClosingPeriodInterface[], reservationDate?: Date): void {
    if (type === OrderType.RESERVATION) {
      if (!reservationDate) {
        throw new InvalidOrderError('a reservation date has to be defined when order type is reservation');
      }

      const now: Date = getCurrentDateAtCanadaEasternTimeZone();
      if (isFirstDateBeforeSecondDateIgnoringHours(reservationDate, now)) {
        throw new InvalidOrderError(`reservation date ${reservationDate.toISOString()} has to be in the future`);
      }

      if (CLOSING_DAYS.includes(reservationDate.getDay())) {
        throw new InvalidOrderError(`reservation date ${reservationDate.toISOString()} has to be between a Tuesday and a Saturday`);
      }

      closingPeriods.forEach((closingPeriod: ClosingPeriodInterface) => {
        if (reservationDate.getTime() >= closingPeriod.startDate.getTime() && reservationDate.getTime() <= closingPeriod.endDate.getTime()) {
          throw new InvalidOrderError(`reservation date ${reservationDate.toISOString()} has to be outside closing periods`);
        }
      });
    }
  }

  private static toProductWithQuantity(productIdWithQuantity: ProductIdWithQuantity, activeProducts: ProductInterface[]): ProductWithQuantity {
    const foundProduct: ProductInterface | undefined = activeProducts.find((product: Product) => product.id === productIdWithQuantity.productId);
    if (!foundProduct) {
      throw new InvalidOrderError(`product with id ${productIdWithQuantity.productId} not found`);
    }

    return { product: foundProduct, quantity: productIdWithQuantity.quantity } as ProductWithQuantity;
  }

  private static getNextDateHavingDay(day: Day): Date {
    const firstAvailableDate: Date = new Date();
    do {
      firstAvailableDate.setDate(firstAvailableDate.getDate() + 1);
    } while (firstAvailableDate.getDay() !== day);

    return firstAvailableDate;
  }

  updateWith(command: UpdateOrderCommand, activeProducts: ProductInterface[], closingPeriods: ClosingPeriodInterface[]): void {
    if (this.id !== command.orderId) {
      throw new InvalidOrderError(`existing order id ${this.id} does not match command order id ${command.orderId}`);
    }

    const isAdmin: boolean = true;
    this.bindProductSelection(command, activeProducts);
    this.bindOrderTypeSelection(command, closingPeriods, isAdmin);
    this.note = command.note;
  }

  private copy(otherOrder: OrderInterface): void {
    const deepCloneOfOtherOrder: OrderInterface = cloneDeep(otherOrder);
    for (const field in deepCloneOfOtherOrder) {
      if (deepCloneOfOtherOrder.hasOwnProperty(field)) {
        this[field] = deepCloneOfOtherOrder[field];
      }
    }
  }

  private bindContactDetails(command: NewOrderCommand): void {
    Order.assertClientNameIsValid(command.clientName);
    Order.assertClientPhoneNumberIsValid(command.clientPhoneNumber);
    Order.assertClientEmailAddressIsValid(command.clientEmailAddress);

    this.clientName = command.clientName;
    this.clientPhoneNumber = command.clientPhoneNumber;
    this.clientEmailAddress = command.clientEmailAddress;
  }

  private bindProductSelection(command: NewOrderCommand | UpdateOrderCommand, activeProducts: ProductInterface[]): void {
    Order.assertProductsAreValid(command.products);

    this.products = command.products.map((productIdWithQuantity: ProductIdWithQuantity) =>
      Order.toProductWithQuantity(productIdWithQuantity, activeProducts)
    );
  }

  private bindOrderTypeSelection(command: NewOrderCommand | UpdateOrderCommand, closingPeriods: ClosingPeriodInterface[], isAdmin: boolean): void {
    Order.assertTypeIsValid(command.type, isAdmin);
    Order.assertPickUpDateIsValid(command.type, closingPeriods, command.pickUpDate);
    Order.assertDeliveryDateIsValid(command.type, closingPeriods, command.deliveryDate);
    Order.assertDeliveryAddressIsValid(command.type, command.deliveryAddress);
    Order.assertReservationDateIsValid(command.type, closingPeriods, command.reservationDate);

    this.type = command.type;
    this.pickUpDate = null;
    this.deliveryDate = null;
    this.deliveryAddress = null;
    this.reservationDate = null;

    switch (this.type) {
      case OrderType.PICK_UP:
        this.pickUpDate = command.pickUpDate;
        break;
      case OrderType.DELIVERY:
        this.deliveryDate = command.deliveryDate;
        this.deliveryAddress = command.deliveryAddress;
        break;
      case OrderType.RESERVATION:
        this.reservationDate = command.reservationDate;
        break;
    }
  }
}

export interface OrderFactoryInterface {
  create(command: NewOrderCommand, activeProducts: ProductInterface[], closingPeriods: ClosingPeriodInterface[], isAdmin: boolean): Order;

  copy(order: OrderInterface): Order;
}
