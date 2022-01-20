import { repeat } from 'lodash';
import { EnvironmentConfigService } from '../../environment-config/environment-config.service';
import { EncryptionService } from '../encryption.service';

describe('infrastructure/config/encryption/EncryptionService', () => {
  let encryptionService: EncryptionService;
  let mockEnvironmentConfigService: EnvironmentConfigService;

  beforeEach(() => {
    mockEnvironmentConfigService = {} as EnvironmentConfigService;
    mockEnvironmentConfigService.get = jest.fn();
    (mockEnvironmentConfigService.get as jest.Mock).mockReturnValue(repeat('x', 32));

    encryptionService = new EncryptionService(mockEnvironmentConfigService);
  });

  describe('encrypt()', () => {
    it('should get encryption key from config', () => {
      // when
      encryptionService.encrypt('a secret value to encrypt');

      // then
      expect(mockEnvironmentConfigService.get).toHaveBeenCalledWith('APP_PERSONAL_DATA_ENCRYPTION_KEY');
    });

    it('should return a string containing a 16 bytes random initialization vector before the separator', async () => {
      // when
      const result: string = await encryptionService.encrypt('a secret value to encrypt');

      // then
      expect(result.substring(0, result.indexOf('___'))).toHaveLength(24);
    });

    it('should return a string containing the encrypted value after the separator', async () => {
      // when
      const result: string = await encryptionService.encrypt('a secret value to encrypt');

      // then
      expect(result.substring(result.indexOf('___') + 3)).toHaveLength(36);
    });
  });

  describe('decrypt()', () => {
    it('should get encryption key from config', () => {
      // when
      encryptionService.decrypt('1IkclDesAoq296SWPL55Vg==___aRMInGWXXs1LdxEK8t8vJSLnpMssZWOKbg==');

      // then
      expect(mockEnvironmentConfigService.get).toHaveBeenCalledWith('APP_PERSONAL_DATA_ENCRYPTION_KEY');
    });

    it('should return the value decrypted using the initialization vector separated with the encrypted value', async () => {
      // given
      const initializationVector: string = '1IkclDesAoq296SWPL55Vg==';
      const encryptedValue: string = 'aRMInGWXXs1LdxEK8t8vJSLnpMssZWOKbg==';
      const valueToDecrypt: string = `${initializationVector}___${encryptedValue}`;

      // when
      const result: string = await encryptionService.decrypt(valueToDecrypt);

      // then
      expect(result).toBe('a secret value to encrypt');
    });
  });
});
