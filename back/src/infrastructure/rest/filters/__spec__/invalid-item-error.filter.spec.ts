import { ArgumentsHost } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { InvalidItemError } from '../../../../domain/errors/invalid-item.error';
import { InvalidItemErrorFilter } from '../invalid-item-error.filter';

describe('infrastructure/rest/filters/InvalidItemErrorFilter', () => {
  let invalidItemErrorFilter: InvalidItemErrorFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn();
    mockJson = jest.fn();

    mockStatus.mockImplementation(() => {
      return {
        json: mockJson,
      };
    });

    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: mockStatus,
        }),
      }),
    } as ArgumentsHost;

    invalidItemErrorFilter = new InvalidItemErrorFilter();
  });

  describe('catch()', () => {
    it('should call response status method with http bad request status code', () => {
      // given
      const invalidItemError: InvalidItemError = {} as InvalidItemError;
      const expected: number = 400;

      // when
      invalidItemErrorFilter.catch(invalidItemError, mockArgumentsHost);

      // then
      expect(mockStatus).toHaveBeenCalledWith(expected);
    });

    it('should call response status json method with body from invalid item error', () => {
      // given
      const fixedDate: Date = new Date('2017-06-13T04:41:20');
      // @ts-ignore
      jest.spyOn(global, 'Date').mockImplementation(() => cloneDeep(fixedDate));

      const invalidItemError: InvalidItemError = {
        name: 'InvalidItemError',
        message: 'An item validation error',
      } as InvalidItemError;

      const expected: object = {
        statusCode: 400,
        timestamp: fixedDate.toISOString(),
        name: 'InvalidItemError',
        message: 'An item validation error',
      };

      // when
      invalidItemErrorFilter.catch(invalidItemError, mockArgumentsHost);

      // then
      expect(mockJson).toHaveBeenCalledWith(expected);
    });
  });
});
