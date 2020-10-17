import { Day } from '../date.constants';

export interface AvailableDayForAPickUpOrder {
  whenOrderIsPlacedOn: Day;
  firstAvailableDay: Day;
}

export const AVAILABLE_DAYS_FOR_A_PICK_UP_ORDER: AvailableDayForAPickUpOrder[] = [
  { whenOrderIsPlacedOn: Day.SUNDAY, firstAvailableDay: Day.TUESDAY },
  { whenOrderIsPlacedOn: Day.MONDAY, firstAvailableDay: Day.THURSDAY },
  { whenOrderIsPlacedOn: Day.TUESDAY, firstAvailableDay: Day.THURSDAY },
  { whenOrderIsPlacedOn: Day.WEDNESDAY, firstAvailableDay: Day.SATURDAY },
  { whenOrderIsPlacedOn: Day.THURSDAY, firstAvailableDay: Day.TUESDAY },
  { whenOrderIsPlacedOn: Day.FRIDAY, firstAvailableDay: Day.TUESDAY },
  { whenOrderIsPlacedOn: Day.SATURDAY, firstAvailableDay: Day.TUESDAY },
];
export const MAXIMUM_HOUR_TO_PLACE_A_PICK_UP_ORDER_BEFORE_BEING_CONSIDERED_AS_PLACED_THE_FOLLOWING_DAY: number = 19;

export const CLOSING_DAYS: Day[] = [Day.SUNDAY, Day.MONDAY];
