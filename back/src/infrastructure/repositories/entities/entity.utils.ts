import { isEmpty } from 'lodash';
import { ValueTransformer } from 'typeorm';
import { getDateAsIsoStringWithoutTime, ISO_DATE_WITH_DASHES_AND_WITHOUT_TIME_LENGTH, parseDateWithTimeAtNoonUTC } from '../../../domain/date.utils';

export const DATE_MAX_LENGTH: number = ISO_DATE_WITH_DASHES_AND_WITHOUT_TIME_LENGTH;
export const ENUM_VALUE_MAX_LENGTH: number = 8;
export const DEFAULT_MAX_LENGTH: number = 255;

const ARRAY_ITEM_SEPARATOR: string = '|||';

export const dateIsoStringValueTransformer: ValueTransformer = {
  from: (dateAsISOString: string): Date => {
    return parseDateWithTimeAtNoonUTC(dateAsISOString);
  },
  to: (date: Date): string => {
    return getDateAsIsoStringWithoutTime(date);
  },
} as ValueTransformer;

export const arrayValueTransformer: ValueTransformer = {
  from: (stringWithSeparators: string): string[] => {
    return isEmpty(stringWithSeparators) ? null : stringWithSeparators.split(ARRAY_ITEM_SEPARATOR);
  },
  to: (array: string[]): string => {
    return isEmpty(array) ? null : array.join(ARRAY_ITEM_SEPARATOR);
  },
} as ValueTransformer;

export const currencyValueTransformer: ValueTransformer = {
  from: (numberWithoutDecimals: number): number => {
    return numberWithoutDecimals / 100;
  },
  to: (numberWithDecimals: number): number => {
    return Math.round(numberWithDecimals * 100);
  },
} as ValueTransformer;
