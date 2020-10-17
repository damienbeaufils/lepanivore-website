import { ArgumentsHost } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { ItemNotFoundError } from '../../../../domain/errors/item-not-found.error';
import { ItemNotFoundErrorFilter } from '../item-not-found-error.filter';

describe('infrastructure/rest/filters/ItemNotFoundErrorFilter', () => {
  let itemNotFoundErrorFilter: ItemNotFoundErrorFilter;
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

    itemNotFoundErrorFilter = new ItemNotFoundErrorFilter();
  });

  describe('catch()', () => {
    it('should call response status method with http not found status code', () => {
      // given
      const itemNotFoundError: ItemNotFoundError = {} as ItemNotFoundError;
      const expected: number = 404;

      // when
      itemNotFoundErrorFilter.catch(itemNotFoundError, mockArgumentsHost);

      // then
      expect(mockStatus).toHaveBeenCalledWith(expected);
    });

    it('should call response status json method with body from item not found error', () => {
      // given
      const fixedDate: Date = new Date('2017-06-13T04:41:20');
      // @ts-ignore
      jest.spyOn(global, 'Date').mockImplementation(() => cloneDeep(fixedDate));

      const itemNotFoundError: ItemNotFoundError = {
        name: 'ItemNotFoundError',
        message: 'An item not found error',
      } as ItemNotFoundError;

      const expected: object = {
        statusCode: 404,
        timestamp: fixedDate.toISOString(),
        name: 'ItemNotFoundError',
        message: 'An item not found error',
      };

      // when
      itemNotFoundErrorFilter.catch(itemNotFoundError, mockArgumentsHost);

      // then
      expect(mockJson).toHaveBeenCalledWith(expected);
    });
  });
});
