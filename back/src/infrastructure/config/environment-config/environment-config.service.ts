import * as Joi from 'joi';
import { ValidationResult } from 'joi';
import { Injectable } from '@nestjs/common';
import { EnvironmentConfigError } from './environment-config.error';

export interface EnvironmentConfig {
  [key: string]: string;
}

@Injectable()
export class EnvironmentConfigService {
  private readonly environmentConfig: EnvironmentConfig;

  constructor() {
    this.environmentConfig = EnvironmentConfigService.validateInput({ ...process.env });
  }

  private static validateInput(environmentConfig: EnvironmentConfig): EnvironmentConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      PORT: Joi.number().default(3001),
      DATABASE_TYPE: Joi.string().default('sqlite'),
      DATABASE_NAME: Joi.string().default('local-db.sqlite'),
      DATABASE_HOST: Joi.string().when('DATABASE_TYPE', { is: 'sqlite', then: Joi.optional(), otherwise: Joi.required() }),
      DATABASE_PORT: Joi.number().when('DATABASE_TYPE', { is: 'sqlite', then: Joi.optional(), otherwise: Joi.required() }),
      DATABASE_USERNAME: Joi.string().when('DATABASE_TYPE', { is: 'sqlite', then: Joi.optional(), otherwise: Joi.required() }),
      DATABASE_PASSWORD: Joi.string().when('DATABASE_TYPE', { is: 'sqlite', then: Joi.optional(), otherwise: Joi.required() }),
      APP_ADMIN_USERNAME: Joi.string().required(),
      APP_ADMIN_ENCRYPTED_PASSWORD: Joi.string().required(),
      APP_EMAIL_ORDER_NOTIFICATION_FROM: Joi.string().required(),
      APP_EMAIL_ORDER_NOTIFICATION_TO: Joi.string().required(),
      APP_EMAIL_ORDER_NOTIFICATION_SUBJECT_PREFIX: Joi.string().default(''),
      APP_JWT_SECRET: Joi.string().required().min(128),
      SMTP_HOST: Joi.string().required(),
      SMTP_PORT: Joi.number().required(),
      SMTP_USERNAME: Joi.string().required(),
      SMTP_PASSWORD: Joi.string().required(),
      SENTRY_DSN: Joi.string().required(),
    }).unknown(true);

    const { error, value: validatedEnvironmentConfig }: ValidationResult = envVarsSchema.validate(environmentConfig);
    if (error) {
      throw new EnvironmentConfigError(`Config validation error: ${error.message}`);
    }

    return validatedEnvironmentConfig;
  }

  get(key: string): string {
    return this.environmentConfig[key];
  }
}
