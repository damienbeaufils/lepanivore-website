import { ArgumentsHost } from '@nestjs/common';
import { InvalidUserError } from '../../../../domain/user/errors/invalid-user.error';
import { InvalidUserErrorFilter } from '../invalid-user-error.filter';

describe('infrastructure/rest/filters/InvalidUserErrorFilter', () => {
  let invalidUserErrorFilter: InvalidUserErrorFilter;
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

    invalidUserErrorFilter = new InvalidUserErrorFilter();
  });

  describe('catch()', () => {
    it('should call response status method with http unauthorized status code', () => {
      // given
      const invalidUserError: InvalidUserError = {} as InvalidUserError;
      const expected: number = 401;

      // when
      invalidUserErrorFilter.catch(invalidUserError, mockArgumentsHost);

      // then
      expect(mockStatus).toHaveBeenCalledWith(expected);
    });

    it('should call response status json method with body from invalid user error', () => {
      // given
      const fixedDate: Date = new Date('2017-06-13T04:41:20');
      // @ts-ignore
      jest.spyOn(global, 'Date').mockImplementationOnce(() => fixedDate);

      const invalidUserError: InvalidUserError = {
        name: 'InvalidUserError',
        message: 'An user validation error',
      } as InvalidUserError;

      const expected: object = {
        statusCode: 401,
        timestamp: fixedDate.toISOString(),
        name: 'InvalidUserError',
        message: 'An user validation error',
      };

      // when
      invalidUserErrorFilter.catch(invalidUserError, mockArgumentsHost);

      // then
      expect(mockJson).toHaveBeenCalledWith(expected);
    });
  });
});
