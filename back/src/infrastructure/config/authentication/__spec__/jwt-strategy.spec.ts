import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../../../domain/user/user';
import { EnvironmentConfigService } from '../../environment-config/environment-config.service';
import { JwtStrategy } from '../jwt-strategy';

describe('infrastructure/config/authentication/JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockEnvironmentConfigService: EnvironmentConfigService;

  beforeEach(() => {
    mockEnvironmentConfigService = {} as EnvironmentConfigService;
    mockEnvironmentConfigService.get = jest.fn();
    (mockEnvironmentConfigService.get as jest.Mock).mockReturnValue('value');

    jwtStrategy = new JwtStrategy(mockEnvironmentConfigService);
  });

  describe('constructor()', () => {
    it('should construct strategy with JWT secret from configuration', () => {
      // then
      expect(mockEnvironmentConfigService.get).toHaveBeenCalledWith('APP_JWT_SECRET');
    });
  });

  describe('validate()', () => {
    it('should reject with UnauthorizedException when payload username is not ADMIN', async () => {
      // given
      const payload: User = { username: 'some-user' };

      // when
      const result: Promise<User> = jwtStrategy.validate(payload);

      // then
      await expect(result).rejects.toThrow(new UnauthorizedException('Username in payload does not match expected ADMIN username'));
    });

    it('should return ADMIN user when payload username is ADMIN', async () => {
      // given
      const payload: User = { username: 'ADMIN' };

      // when
      const result: User = await jwtStrategy.validate(payload);

      // then
      expect(result).toStrictEqual({ username: 'ADMIN' });
    });
  });
});
