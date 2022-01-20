import { repeat } from 'lodash';
import { EnvironmentConfigError } from '../environment-config.error';
import { EnvironmentConfigService } from '../environment-config.service';
import ProcessEnv = NodeJS.ProcessEnv;

describe('infrastructure/config/environment-config/EnvironmentConfigService', () => {
  beforeEach(() => {
    const env: ProcessEnv = {
      PORT: '1111',
      DATABASE_TYPE: 'database-type',
      DATABASE_HOST: 'database-host',
      DATABASE_PORT: '1234',
      DATABASE_USERNAME: 'database-username',
      DATABASE_PASSWORD: 'database-password',
      DATABASE_NAME: 'database-name',
      APP_ADMIN_USERNAME: 'app-admin-username',
      APP_ADMIN_ENCRYPTED_PASSWORD: 'app-admin-encrypted-password',
      APP_EMAIL_ORDER_NOTIFICATION_FROM: 'app-email-order-notification-from',
      APP_EMAIL_ORDER_NOTIFICATION_TO: 'app-email-order-notification-cc',
      APP_PERSONAL_DATA_ENCRYPTION_KEY: repeat('x', 32),
      APP_JWT_SECRET: repeat('x', 128),
      SMTP_HOST: 'smtp-host',
      SMTP_PORT: '789',
      SMTP_USERNAME: 'smtp-username',
      SMTP_PASSWORD: 'smtp-password',
      SENTRY_DSN: 'sentry-dsn',
    } as ProcessEnv;

    process.env = {
      ...process.env,
      ...env,
    };
  });

  describe('constructor()', () => {
    it('should allow unknown variables', () => {
      // given
      process.env.UNKNOWN = 'any-value';

      // when
      const result = () => new EnvironmentConfigService();

      // then
      expect(result).not.toThrow();
    });

    describe('PORT', () => {
      it('should fail when not a number', () => {
        // given
        process.env.PORT = 'not-a-number';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "PORT" must be a number'));
      });
      it('should be defaulted to 3001', () => {
        // given
        process.env.PORT = undefined;

        // when
        const result: EnvironmentConfigService = new EnvironmentConfigService();

        // then
        expect(result.get('PORT')).toBe(3001);
      });
    });

    describe('DATABASE_TYPE', () => {
      it('should be defaulted to sqlite', () => {
        // given
        process.env.DATABASE_TYPE = undefined;

        // when
        const result: EnvironmentConfigService = new EnvironmentConfigService();

        // then
        expect(result.get('DATABASE_TYPE')).toBe('sqlite');
      });
    });

    describe('DATABASE_NAME', () => {
      it('should be defaulted to local-db.sqlite', () => {
        // given
        process.env.DATABASE_NAME = undefined;

        // when
        const result: EnvironmentConfigService = new EnvironmentConfigService();

        // then
        expect(result.get('DATABASE_NAME')).toBe('local-db.sqlite');
      });
    });

    describe('when DATABASE_TYPE is postgres', () => {
      beforeEach(() => {
        process.env.DATABASE_TYPE = 'postgres';
      });

      describe('DATABASE_HOST', () => {
        it('should fail when empty', () => {
          // given
          process.env.DATABASE_HOST = '';

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).toThrow(new EnvironmentConfigError('Config validation error: "DATABASE_HOST" is not allowed to be empty'));
        });
      });

      describe('DATABASE_PORT', () => {
        it('should fail when not a number', () => {
          // given
          process.env.DATABASE_PORT = 'not-a-number';

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).toThrow(new EnvironmentConfigError('Config validation error: "DATABASE_PORT" must be a number'));
        });
      });

      describe('DATABASE_USERNAME', () => {
        it('should fail when empty', () => {
          // given
          process.env.DATABASE_USERNAME = '';

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).toThrow(new EnvironmentConfigError('Config validation error: "DATABASE_USERNAME" is not allowed to be empty'));
        });
      });

      describe('DATABASE_PASSWORD', () => {
        it('should fail when empty', () => {
          // given
          process.env.DATABASE_PASSWORD = '';

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).toThrow(new EnvironmentConfigError('Config validation error: "DATABASE_PASSWORD" is not allowed to be empty'));
        });
      });
    });

    describe('when DATABASE_TYPE is sqlite', () => {
      beforeEach(() => {
        process.env.DATABASE_TYPE = 'sqlite';
      });

      describe('DATABASE_HOST', () => {
        it('should be optional', () => {
          // given
          process.env.DATABASE_HOST = undefined;

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).not.toThrow();
        });
      });

      describe('DATABASE_PORT', () => {
        it('should be optional', () => {
          // given
          process.env.DATABASE_PORT = undefined;

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).not.toThrow();
        });
      });

      describe('DATABASE_USERNAME', () => {
        it('should be optional', () => {
          // given
          process.env.DATABASE_USERNAME = undefined;

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).not.toThrow();
        });
      });

      describe('DATABASE_PASSWORD', () => {
        it('should be optional', () => {
          // given
          process.env.DATABASE_PASSWORD = undefined;

          // when
          const result = () => new EnvironmentConfigService();

          // then
          expect(result).not.toThrow();
        });
      });
    });

    describe('APP_ADMIN_USERNAME', () => {
      it('should fail when empty', () => {
        // given
        process.env.APP_ADMIN_USERNAME = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_ADMIN_USERNAME" is not allowed to be empty'));
      });
    });

    describe('APP_ADMIN_ENCRYPTED_PASSWORD', () => {
      it('should fail when empty', () => {
        // given
        process.env.APP_ADMIN_ENCRYPTED_PASSWORD = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_ADMIN_ENCRYPTED_PASSWORD" is not allowed to be empty'));
      });
    });

    describe('APP_EMAIL_ORDER_NOTIFICATION_FROM', () => {
      it('should fail when empty', () => {
        // given
        process.env.APP_EMAIL_ORDER_NOTIFICATION_FROM = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_EMAIL_ORDER_NOTIFICATION_FROM" is not allowed to be empty'));
      });
    });

    describe('APP_EMAIL_ORDER_NOTIFICATION_TO', () => {
      it('should fail when empty', () => {
        // given
        process.env.APP_EMAIL_ORDER_NOTIFICATION_TO = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_EMAIL_ORDER_NOTIFICATION_TO" is not allowed to be empty'));
      });
    });

    describe('APP_EMAIL_ORDER_NOTIFICATION_SUBJECT_PREFIX', () => {
      it('should be defaulted to empty string', () => {
        // given
        process.env.APP_EMAIL_ORDER_NOTIFICATION_SUBJECT_PREFIX = undefined;

        // when
        const result: EnvironmentConfigService = new EnvironmentConfigService();

        // then
        expect(result.get('APP_EMAIL_ORDER_NOTIFICATION_SUBJECT_PREFIX')).toBe('');
      });
    });

    describe('APP_PERSONAL_DATA_ENCRYPTION_KEY', () => {
      it('should fail when empty', () => {
        // given
        process.env.APP_PERSONAL_DATA_ENCRYPTION_KEY = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_PERSONAL_DATA_ENCRYPTION_KEY" is not allowed to be empty'));
      });
      it('should fail when less than 32 characters', () => {
        // given
        process.env.APP_PERSONAL_DATA_ENCRYPTION_KEY = repeat('x', 31);

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(
          new EnvironmentConfigError('Config validation error: "APP_PERSONAL_DATA_ENCRYPTION_KEY" length must be 32 characters long')
        );
      });
      it('should fail when more than 32 characters', () => {
        // given
        process.env.APP_PERSONAL_DATA_ENCRYPTION_KEY = repeat('x', 33);

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(
          new EnvironmentConfigError('Config validation error: "APP_PERSONAL_DATA_ENCRYPTION_KEY" length must be 32 characters long')
        );
      });
    });

    describe('APP_JWT_SECRET', () => {
      it('should fail when empty', () => {
        // given
        process.env.APP_JWT_SECRET = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_JWT_SECRET" is not allowed to be empty'));
      });
      it('should fail when less than 128 characters', () => {
        // given
        process.env.APP_JWT_SECRET = repeat('x', 127);

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "APP_JWT_SECRET" length must be at least 128 characters long'));
      });
    });

    describe('SMTP_HOST', () => {
      it('should fail when empty', () => {
        // given
        process.env.SMTP_HOST = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "SMTP_HOST" is not allowed to be empty'));
      });
    });

    describe('SMTP_PORT', () => {
      it('should fail when empty', () => {
        // given
        process.env.SMTP_PORT = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "SMTP_PORT" must be a number'));
      });
    });

    describe('SMTP_USERNAME', () => {
      it('should fail when empty', () => {
        // given
        process.env.SMTP_USERNAME = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "SMTP_USERNAME" is not allowed to be empty'));
      });
    });

    describe('SMTP_PASSWORD', () => {
      it('should fail when empty', () => {
        // given
        process.env.SMTP_PASSWORD = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "SMTP_PASSWORD" is not allowed to be empty'));
      });
    });

    describe('SENTRY_DSN', () => {
      it('should fail when empty', () => {
        // given
        process.env.SENTRY_DSN = '';

        // when
        const result = () => new EnvironmentConfigService();

        // then
        expect(result).toThrow(new EnvironmentConfigError('Config validation error: "SENTRY_DSN" is not allowed to be empty'));
      });
    });
  });

  describe('get()', () => {
    it('should return variable from process.env', () => {
      // given
      const expected: string = 'any value';
      process.env.TEST_ENV_VAR = expected;
      const environmentConfigService: EnvironmentConfigService = new EnvironmentConfigService();

      // when
      const result: string = environmentConfigService.get('TEST_ENV_VAR');

      // then
      expect(result).toBe(expected);
    });
  });
});
