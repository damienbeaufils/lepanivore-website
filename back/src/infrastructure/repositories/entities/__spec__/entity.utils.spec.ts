import { arrayValueTransformer, currencyValueTransformer, dateIsoStringValueTransformer } from '../entity.utils';

describe('infrastructure/repositories/entities/entity.utils', () => {
  describe('dateIsoStringValueTransformer', () => {
    describe('from()', () => {
      it('should transform ISO string to date', () => {
        // given
        const value: string = '2019-11-15';

        // when
        const result: Date = dateIsoStringValueTransformer.from(value);

        // then
        expect(result).toStrictEqual(new Date('2019-11-15T12:00:00.000Z'));
      });
      it('should transform ISO string with time to date', () => {
        // given
        const value: string = '2019-11-15T15:09:05.119Z';

        // when
        const result: Date = dateIsoStringValueTransformer.from(value);

        // then
        expect(result).toStrictEqual(new Date('2019-11-15T12:00:00.000Z'));
      });
      it('should not transform anything when value is undefined', () => {
        // given
        const value: string = undefined;

        // when
        const result: Date = dateIsoStringValueTransformer.from(value);

        // then
        expect(result).toBeUndefined();
      });
    });
    describe('to()', () => {
      it('should transform date to ISO string', () => {
        // given
        const date: Date = new Date('2019-11-15T15:09:05.119Z');

        // when
        const result: string = dateIsoStringValueTransformer.to(date);

        // then
        expect(result).toBe('2019-11-15');
      });
      it('should not transform anything when date is undefined', () => {
        // given
        const date: Date = undefined;

        // when
        const result: string = dateIsoStringValueTransformer.to(date);

        // then
        expect(result).toBeUndefined();
      });
    });
  });

  describe('arrayValueTransformer', () => {
    describe('from()', () => {
      it('should transform string with separators to string array', () => {
        // given
        const stringWithSeparators: string = 'hello|||world';

        // when
        const result: string = arrayValueTransformer.from(stringWithSeparators);

        // then
        expect(result).toStrictEqual(['hello', 'world']);
      });
      it('should transform string with separators to null when empty string', () => {
        // given
        const stringWithSeparators: string = '';

        // when
        const result: string = arrayValueTransformer.from(stringWithSeparators);

        // then
        expect(result).toBeNull();
      });
    });
    describe('to()', () => {
      it('should transform string array to string with separators', () => {
        // given
        const array: string[] = ['hello', 'world'];

        // when
        const result: string = arrayValueTransformer.to(array);

        // then
        expect(result).toBe('hello|||world');
      });
      it('should transform string array to null when empty array', () => {
        // given
        const array: string[] = [];

        // when
        const result: string = arrayValueTransformer.to(array);

        // then
        expect(result).toBeNull();
      });
    });
  });

  describe('currencyValueTransformer', () => {
    describe('from()', () => {
      it('should transform number without decimals to number with two decimals', () => {
        // given
        const numberWithoutDecimals: number = 510;

        // when
        const result: number = currencyValueTransformer.from(numberWithoutDecimals);

        // then
        expect(result).toBe(5.1);
      });
    });
    describe('to()', () => {
      it('should transform number with two decimals to number without decimals', () => {
        // given
        const numberWithTwoDecimals: number = 5.1;

        // when
        const result: number = currencyValueTransformer.to(numberWithTwoDecimals);

        // then
        expect(result).toBe(510);
      });
    });
  });
});
