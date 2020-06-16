import { cloneDeep } from 'lodash';

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
