import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../../../domain/user/user';
import { JwtAuthGuard } from '../jwt-auth-guard';

describe('infrastructure/config/authentication/JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let mockReflector: Reflector;

  let err: object;
  let user: User | boolean;
  let info: object;
  let context: ExecutionContext;
  let status: object;

  beforeEach(() => {
    mockReflector = {} as Reflector;
    mockReflector.get = jest.fn();
    jwtAuthGuard = new JwtAuthGuard(mockReflector);

    err = {};
    user = {} as User;
    info = {};
    context = {} as ExecutionContext;
    status = undefined;
    context.getHandler = jest.fn();
  });

  describe('handleRequest()', () => {
    it('should use reflector to get public metadata value', () => {
      // given
      const contextFunction = () => {};
      (context.getHandler as jest.Mock).mockReturnValue(contextFunction);

      user = false;
      (mockReflector.get as jest.Mock).mockReturnValue(true);

      // when
      jwtAuthGuard.handleRequest(err, user, info, context, status);

      // then
      expect(mockReflector.get).toHaveBeenCalledWith('isPublic', contextFunction);
    });

    it('should return anonymous user when no user and public access', () => {
      // given
      user = false;
      (mockReflector.get as jest.Mock).mockReturnValue(true);

      // when
      const result: User = jwtAuthGuard.handleRequest(err, user, info, context, status);

      // then
      expect(result).toStrictEqual({ username: 'ANONYMOUS' });
    });

    it('should not return anonymous user when user is defined and public access', () => {
      // given
      user = { username: 'ADMIN' };
      (mockReflector.get as jest.Mock).mockReturnValue(true);

      let result: User;
      try {
        // when
        result = jwtAuthGuard.handleRequest(err, user, info, context, status);
      } catch (e) {
        // ignore error
      } finally {
        // then
        expect(result).not.toEqual({ username: 'ANONYMOUS' });
      }
    });

    it('should not return anonymous user when no user and no public access', () => {
      // given
      user = false;
      (mockReflector.get as jest.Mock).mockReturnValue(false);

      let result: User;
      try {
        // when
        result = jwtAuthGuard.handleRequest(err, user, info, context, status);
      } catch (e) {
        // ignore error
      } finally {
        // then
        expect(result).not.toEqual({ username: 'ANONYMOUS' });
      }
    });
  });
});
