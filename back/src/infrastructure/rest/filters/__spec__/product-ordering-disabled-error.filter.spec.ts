import { ArgumentsHost } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { ProductOrderingDisabledError } from '../../../../domain/feature/errors/product-ordering-disabled.error';
import { ProductOrderingDisabledErrorFilter } from '../product-ordering-disabled-error.filter';

describe('infrastructure/rest/filters/ProductOrderingDisabledErrorFilter', () => {
  let productOrderingDisabledErrorFilter: ProductOrderingDisabledErrorFilter;
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

    productOrderingDisabledErrorFilter = new ProductOrderingDisabledErrorFilter();
  });

  describe('catch()', () => {
    it('should call response status method with http service unavailable status code', () => {
      // given
      const productOrderingDisabledError: ProductOrderingDisabledError = {} as ProductOrderingDisabledError;
      const expected: number = 503;

      // when
      productOrderingDisabledErrorFilter.catch(productOrderingDisabledError, mockArgumentsHost);

      // then
      expect(mockStatus).toHaveBeenCalledWith(expected);
    });

    it('should call response status json method with body from product ordering disabled error', () => {
      // given
      const fixedDate: Date = new Date('2017-06-13T04:41:20');
      // @ts-ignore
      jest.spyOn(global, 'Date').mockImplementation(() => cloneDeep(fixedDate));

      const productOrderingDisabledError: ProductOrderingDisabledError = {
        name: 'ProductOrderingDisabledError',
        message: 'A product ordering disabled error',
      } as ProductOrderingDisabledError;

      const expected: object = {
        statusCode: 503,
        timestamp: fixedDate.toISOString(),
        name: 'ProductOrderingDisabledError',
        message: 'A product ordering disabled error',
      };

      // when
      productOrderingDisabledErrorFilter.catch(productOrderingDisabledError, mockArgumentsHost);

      // then
      expect(mockJson).toHaveBeenCalledWith(expected);
    });
  });
});
