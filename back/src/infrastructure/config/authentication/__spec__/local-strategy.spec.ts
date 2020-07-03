import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../../../domain/user/user';
import { EnvironmentConfigService } from '../../environment-config/environment-config.service';
import { LocalStrategy } from '../local-strategy';

describe('infrastructure/config/authentication/LocalStrategy', () => {
  let jwtStrategy: LocalStrategy;
  let mockEnvironmentConfigService: EnvironmentConfigService;

  beforeEach(() => {
    mockEnvironmentConfigService = {} as EnvironmentConfigService;
    mockEnvironmentConfigService.get = jest.fn();

    jwtStrategy = new LocalStrategy(mockEnvironmentConfigService);
  });

  describe('validate()', () => {
    let username: string;
    let password: string;

    beforeEach(() => {
      username = 'admin-username';
      password = 'admin-password';

      (mockEnvironmentConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'APP_ADMIN_USERNAME') return 'admin-username';
        if (key === 'APP_ADMIN_ENCRYPTED_PASSWORD') return '$2b$04$L0DeV7eth.4CR9f8g517jeosKuHiX3Wc3aFV6n0Kgo4wnF32mQVR6';

        return null;
      });
    });

    it('should reject with UnauthorizedException when username is not the configured admin username', async () => {
      // given
      username = 'some-username';

      // when
      const result: Promise<User> = jwtStrategy.validate(username, password);

      // then
      await expect(result).rejects.toThrow(new UnauthorizedException('Wrong username or password'));
    });

    it('should reject with UnauthorizedException when password is not the configured admin password', async () => {
      // given
      username = 'some-password';

      // when
      const result: Promise<User> = jwtStrategy.validate(username, password);

      // then
      await expect(result).rejects.toThrow(new UnauthorizedException('Wrong username or password'));
    });

    it('should reject with UnauthorizedException when configured password is not encrypted', async () => {
      // given
      (mockEnvironmentConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'APP_ADMIN_USERNAME') return 'admin-username';
        if (key === 'APP_ADMIN_ENCRYPTED_PASSWORD') return 'admin-password';

        return null;
      });

      // when
      const result: Promise<User> = jwtStrategy.validate(username, password);

      // then
      await expect(result).rejects.toThrow(new UnauthorizedException('Wrong username or password'));
    });

    it('should return ADMIN user when both username and password are correct', async () => {
      // when
      const result: User = await jwtStrategy.validate(username, password);

      // then
      expect(result).toStrictEqual({ username: 'ADMIN' });
    });
  });
});
