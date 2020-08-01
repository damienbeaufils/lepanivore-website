import { cloneDeep } from 'lodash';

export const ISO_DATE_WITH_DASHES_AND_WITHOUT_TIME_LENGTH: number = 10;

export const isFirstDateBeforeSecondDateIgnoringHours = (firstDate: Date, secondDate: Date): boolean => {
  const secondDateCopy: Date = cloneDeep(secondDate);
  secondDateCopy.setHours(firstDate.getHours(), firstDate.getMinutes(), firstDate.getSeconds(), firstDate.getMilliseconds());

  return firstDate.getTime() < secondDateCopy.getTime();
};

export const getNumberOfDaysBetweenFirstDateAndSecondDate = (firstDate: Date, secondDate: Date): number => {
  return Math.ceil(Math.abs(firstDate.getTime() - secondDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const getCurrentDateAtCanadaEasternTimeZone = (): Date => {
  const nowAtCanadaEasternTimeZone: string = new Date().toLocaleString('en-US', { timeZone: 'Canada/Eastern' });

  return new Date(nowAtCanadaEasternTimeZone);
};

export const parseDateWithTimeAtNoonUTC = (dateAsISOString: string): Date => {
  if (!dateAsISOString) {
    return undefined;
  }

  const dateAsISOStringWithoutTime: string =
    dateAsISOString.length > ISO_DATE_WITH_DASHES_AND_WITHOUT_TIME_LENGTH
      ? dateAsISOString.substr(0, ISO_DATE_WITH_DASHES_AND_WITHOUT_TIME_LENGTH)
      : dateAsISOString;

  return new Date(`${dateAsISOStringWithoutTime}T12:00:00Z`);
};

export const getDateAsIsoStringWithoutTime = (date: Date): string => {
  return date ? date.toISOString().split('T')[0] : undefined;
};
