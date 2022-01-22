import { repeat } from 'lodash';
import { EnvironmentConfigService } from '../src/infrastructure/config/environment-config/environment-config.service';

export const ADMIN_E2E_USERNAME: string = 'admin-e2e-username';
export const ADMIN_E2E_PASSWORD: string = 'admin-e2e-password';

export const e2eEnvironmentConfigService: EnvironmentConfigService = {
  get(key: string): string {
    if (key === 'DATABASE_TYPE') return 'sqlite';
    if (key === 'DATABASE_NAME') return 'e2e.sqlite';
    if (key === 'APP_ADMIN_USERNAME') return ADMIN_E2E_USERNAME;
    if (key === 'APP_ADMIN_ENCRYPTED_PASSWORD') return '$2b$12$LWqaez7mwtVV.LIlsjbq4u9kh8kSWppnSNapt4zMabKjFkXZoSTHu'; // 'admin-e2e-password'
    if (key === 'APP_PERSONAL_DATA_ENCRYPTION_KEY') return repeat('x', 32);
    if (key === 'APP_JWT_SECRET') return repeat('x', 128);

    return null;
  },
} as EnvironmentConfigService;
